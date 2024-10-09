"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var OLD_COLLECTION_ID = 1;
var NEW_COLLECTION_ID = 2;
var OLD_PREFIX = "space";
var NEW_PREFIX = "urban";
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var originalCourses, courses, _i, courses_1, course, modification;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.courses.findMany({
                    where: {
                        isSeason: 1,
                        collectionId: OLD_COLLECTION_ID
                    }
                })];
            case 1:
                originalCourses = _a.sent();
                courses = JSON.parse(JSON.stringify(originalCourses));
                _i = 0, courses_1 = courses;
                _a.label = 2;
            case 2:
                if (!(_i < courses_1.length)) return [3 /*break*/, 5];
                course = courses_1[_i];
                return [4 /*yield*/, prisma.course_modification.findFirst({ where: { course_ID: course.ID } })];
            case 3:
                modification = _a.sent();
                if (modification) {
                    course.definition = modification.definition;
                    course.displayName = modification.displayName || course.displayName;
                }
                course.parsedDefinition = JSON.parse(course.definition);
                course.parsedDefinition.parts.forEach(function (part) {
                    Object.assign(part, ({
                        subtype: part.subtype.replace(OLD_PREFIX, NEW_PREFIX)
                    }));
                });
                course.definition = JSON.stringify(course.parsedDefinition);
                delete course.parsedDefinition;
                delete course.ID;
                course.alias = course.alias + "_" + NEW_PREFIX;
                course.displayName = course.displayName + "_" + NEW_PREFIX;
                course.collectionId = NEW_COLLECTION_ID;
                course.status = 0;
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5:
                console.log("Creating courses ...");
                return [4 /*yield*/, prisma.courses.createMany({ data: courses })];
            case 6:
                _a.sent();
                console.log("DONE!!");
                return [2 /*return*/];
        }
    });
}); })();
