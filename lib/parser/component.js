var _ = require('underscore'),
    Config = require('./config'),
    Component;

Component = function(confiFile) {
    this.components = null;
    this.fileName = confiFile;
    this.read();
};

Component.prototype = new Config();

Component.prototype.replaceDependencies = function(files, type, components) {
    var result = [];

    _.each(files, function(fileName) {
        var component;
        fileName = fileName.replace(/\s/g, '');
        if (fileName.indexOf('res:') === 0) {
            component = components[fileName.replace('res:', '')][type];
            if (typeof component !== 'undefined') {
                result = _.union(result, component);
            }
        } else {
            result = _.union(result, fileName);
        }
    });

    return result;
};
Component.prototype.replaceFile = function(file, type, components) {
    // if (file) {
    //     var file = file.replace(/\s/g, ''),
    //     component = components[file.replace('res:', '')][type];
    //     file = component ? component : '';
    // }
    return file ? file : '';
};
Component.prototype._parse = function(configs) {
    var _this = this,
        components;

    if (configs === null) {
        return null;
    }

    components = {};

    /**
     * Replace the res:xxxxxx with the absolute path
     */
    _.each(configs, function(configSet, key) {
        var componentResoures = {
                javascript: [],
                css: [],
                scss: ''
            };

        if (typeof configSet.javascript !== 'undefined') {
            componentResoures.javascript = _this.replaceDependencies(
                configSet.javascript, 'javascript', configs
            );
        }

        if (typeof configSet.css !== 'undefined') {
            componentResoures.css = _this.replaceDependencies(
                configSet.css, 'css', configs
            );
        }

        if (typeof configSet.scss !== 'undefined') {
            componentResoures.scss = _this.replaceFile(
                configSet.scss, 'scss', configs
            );
        }

        components[key] = componentResoures;
    });


    /**
     * Recursion call itself untill there no resources need to replace with the absolute path
     */
    recursionReplace = _.size(
        _.filter(components, function(component, key) {
            var javascript = component.javascript,
                css = component.css,
                scss = component.scss;

            javascript = _.filter(javascript, function(fileName) {
                return fileName.indexOf('res:') === 0;
            });

            css = _.filter(css, function(fileName) {
                return fileName.indexOf('res:') === 0;
            });

            scss = scss.indexOf('res:') === 0;

            return (_.size(javascript) > 0 || _.size(css) > 0);
        })
    ) > 0;
    if (recursionReplace) {
        return _this._parse(components);
    }
    return components;
};

Component.prototype.parse = function(componentName) {
    var components;

    if (this.components === null) {
        this.components = this._parse(this.configs);
    }

    components = this.components;
    if (components === null) {
        return null;
    }

    if (typeof componentName === 'undefined' || componentName === null) {
        return components;
    }

    if (typeof components[componentName] === 'undefined') {
        return null;
    }

    return components[componentName];
};

module.exports = Component;
