var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var fs = require("fs");
var files = fs.readdirSync(process.cwd()).filter(function (filename) { return !~filename.indexOf("migrate"); }).filter(function (filename) { return !~filename.indexOf("course-definition-repo"); });
console.log("files", files);
files.forEach(function (filename) {
    var content = fs.readFileSync(filename, "utf8").replace("export default ", "");
    var courseDefinition = JSON.parse(content);
    var migratedCourseDefinition = migrateCourseDefinition(courseDefinition);
    if (JSON.stringify(courseDefinition) !== JSON.stringify(migratedCourseDefinition)) {
        console.log("migrated", filename);
        fs.writeFileSync(filename, 'export default ' + JSON.stringify(migratedCourseDefinition, null, '  '), "utf8");
    }
});
function migrateCourseDefinition(_courseDefinition) {
    var courseDefinition = JSON.parse(JSON.stringify(_courseDefinition));
    if (courseDefinition.parts.find(function (part) { return typeof part.id === "string"; })) {
        courseDefinition.parts = courseDefinition.parts.map(function (part, index) { return (__assign(__assign({}, part), { id: index + 1, type: (part.id && typeof part.id === "string") ? "solid" : part.type, subtype: part.id || part.subtype })); });
        return courseDefinition;
    }
    else {
        return courseDefinition;
    }
}
