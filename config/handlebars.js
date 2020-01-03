var register = function (Handlebars) {
    let helpers = {
        trimString: function (longString, end = 100) {
            if (longString.length > end)
                return longString.substring(0, end);
            return longString;
        },
        defaultValue: function (modelValue, defaultValue) {
            if (!modelValue) return defaultValue;
            return modelValue;
        },
        dateToFarsi: function (dateValue) {
            let currentDate = new Date(dateValue);
            let farsiDate = new Intl.DateTimeFormat('fa-IR').format(currentDate);
            return farsiDate;
        }
    }
    if (Handlebars && typeof Handlebars.registerHelper === "function") {
        for (let prop in helpers) {
            Handlebars.registerHelper(prop, helpers[prop]);
        }
    } else {
        return helpers;
    }
}
module.exports.register = register;
module.exports.helpers = register(null)