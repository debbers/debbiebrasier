(function() {

	var _ = require("underscore"),
		fs = require("fs"),
		rimraf = require("./node_modules/rimraf");

	module.exports = {
		defaults: {
			dir: "DustTemplates/",
			dataDir: "DustData/",
			version: ""
		},
		init: function(settings) {
			this.settings = _.defaults(settings, this.defaults);

			var me = this,
				dustconfig = {},
				templates = this.findFiles(this.settings.dir);
				configFiles = _.filter(this.findFiles(this.settings.dataDir), function(file) {
					// just return config.js files and if a version is provided, only the one in that folder
					var match = true;
					if (me.settings.version) {
						match = file.indexOf(me.settings.version) > -1;
					}
					return match && file.indexOf("config.js") > -1;
				});

			// build the config data for each config file
			_.each(configFiles, function(config) {
				var configData = require(__dirname + "/" + config),
					contractData = me.cleanContractData(configData),
					version = me.settings.version || config.split(me.settings.dataDir)[1].split("/")[0];

				_.extend(dustconfig, me.buildVersion(version, configData, contractData, templates));
			});

			return dustconfig;
		},
		// recursively go through a directory and return all the files
		findFiles: function(dir) {
			var me = this,
				files = fs.readdirSync(dir),
				dirs = [],
				fileList = [];

			_.each(files, function(file) {
				var path = dir + file,
					stat = fs.statSync(path);

				// if it is a sub-directory, call findFiles again
				if (stat && stat.isDirectory() && file != "global") {
					//merge the current fileList with the one returned from the sub-directory
					fileList = _.union(fileList, me.findFiles(path + "/"));
				} else {
					// add the file to the list
					fileList.push(path);
				}
			});

			// return all the files in the directory
			return fileList;
		},
		// clean up the config data specific to the contracts and put them in the TRS buckets
		cleanContractData: function(config) {
			var organizedContracts = {
					dc: [],
					db: [],
					nqdc: [],
					nqdb: []
				};

			_.each(config.contracts, function(contract) {
				var type = contract.type;
				// checking type to match against any of the categories just an "or" regex
				if (type.match(/^(401k|ria|riaCS|esop|ksop|403b|457|401kSA)$/i)) {
					organizedContracts.dc.push(contract);
				} else if (type.match(/^(db|cb)$/i)) {
					organizedContracts.db.push(contract);
				} else if (type.match(/^(nqExcess|nq457b|nq457f|nqPop|nqPopEX|nqLTIP)$/i)) {
					organizedContracts.nqdc.push(contract);
				} else if (type.match(/^nqDB$/i)) {
					organizedContracts.nqdb.push(contract);
				}
			});

			return organizedContracts;
		},
		// build the config data for the dusthtml grunt task
		buildVersion: function (version, data, contractData, templates) {
			var me = this,
				contracts = data.contracts,
				path = "dist/" + version + "/",
				dustconfig = {},
				retirementAccountsData = require(__dirname + "/src/js/retirementAccountsData.js");

				_.each(contracts, function(contract) {
					_.each(templates, function(template) {
						// use the path of the template to form the src and dest properties
						var templateParts = template.split(me.settings.dir)[1].split("."),
							fileName = templateParts[0],
							contractName = template.indexOf("_renderOnce") > -1 ? "" : contract.path,
							path = version + "/" + contractName + "/"+ fileName;

						//nqExcess gets extra data from src/js/retirementAccountsData.js
						if(contract.type == "nqExcess" || contract.type == "nqDB"){
							contract.accounts = retirementAccountsData;
						}

						// make sure it is a template and ignore those that begin with "_"
						if (templateParts[1] == "dust" && fileName.split("/").pop().charAt(0) != "_") {
							// property name is path with / replaced with _
							dustconfig[path.replace(/\//g, "_")] = {
								src: me.settings.dir + fileName + ".dust",
								dest: "dist/" + path + ".html",
								options: {
									context: [data, {
										contract: contract,
										organizedContracts: contractData
									}],
									basePath: me.settings.dir,
									whitespace: true
								}
							};
						}
						
					});
				});

			return dustconfig;
		}
	};
})();