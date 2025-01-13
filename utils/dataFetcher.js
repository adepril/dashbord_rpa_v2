"use strict";
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserIdByUsername = fetchUserIdByUsername;
exports.fetchAgenciesByIds = fetchAgenciesByIds;
exports.fetchProgramsByAgencyId = fetchProgramsByAgencyId;
exports.fetchAllRobotsByAgency = fetchAllRobotsByAgency;
exports.fetchDataReportingByRobot = fetchDataReportingByRobot;
exports.fetchEvolutionsByProgram = fetchEvolutionsByProgram;
exports.fetchRandomQuote = fetchRandomQuote;
exports.fetchStatuts = fetchStatuts;
var firestore_1 = require("firebase/firestore");
var Dashboard_1 = require("../components/Dashboard");
var firebase_1 = require("../lib/firebase");
// Variable globale pour stocker tous les programmes
var allRobotsByAgency = [];
/**
 * Fetches the user data for the given username from Firestore.
 * @param {string} username - The username to search for.
 * @returns {Promise<UserData | null>} - The user data if found, or null if not found.
 */
function fetchUserIdByUsername(username) {
    return __awaiter(this, void 0, void 0, function () {
        var usersRef, q, querySnapshot, userData, userDataFormatted, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Fetching user data for username:', username);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    usersRef = (0, firestore_1.collection)(firebase_1.db, 'utilisateurs');
                    q = (0, firestore_1.query)(usersRef, (0, firestore_1.where)('userName', '==', username));
                    return [4 /*yield*/, (0, firestore_1.getDocs)(q)];
                case 2:
                    querySnapshot = _a.sent();
                    if (querySnapshot.empty) {
                        console.log('No user found with username:', username);
                        return [2 /*return*/, null];
                    }
                    userData = querySnapshot.docs[0].data();
                    console.log('User data found:', userData);
                    console.log('userAgenceIds:', userData.userAgenceIds);
                    userDataFormatted = {
                        userId: userData.userId,
                        userName: userData.userName,
                        userAgenceIds: userData.userAgenceIds || []
                    };
                    console.log('Formatted user data:', userDataFormatted);
                    return [2 /*return*/, userDataFormatted];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error fetching user data:', error_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetches all agencies for a given list of IDs.
 * Returns an array of agency objects with idAgence and nomAgence properties.
 * If no agency is found with a given ID, it is skipped.
 * If an error occurs, an empty array is returned.
 * @param agencyIds the list of agency IDs to fetch
 * @returns an array of agency objects
 */
function fetchAgenciesByIds(agencyIds) {
    return __awaiter(this, void 0, void 0, function () {
        var agenciesRef, agencies, _i, agencyIds_1, agencyId, q, querySnapshot, agencyData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Fetching agencies for IDs:', agencyIds);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    agenciesRef = (0, firestore_1.collection)(firebase_1.db, 'agences');
                    agencies = [];
                    _i = 0, agencyIds_1 = agencyIds;
                    _a.label = 2;
                case 2:
                    if (!(_i < agencyIds_1.length)) return [3 /*break*/, 5];
                    agencyId = agencyIds_1[_i];
                    if (!(agencyId != "-")) return [3 /*break*/, 4];
                    console.log('Fetching agency with ID:', agencyId);
                    q = (0, firestore_1.query)(agenciesRef, (0, firestore_1.where)('idAgence', '==', agencyId));
                    return [4 /*yield*/, (0, firestore_1.getDocs)(q)];
                case 3:
                    querySnapshot = _a.sent();
                    if (!querySnapshot.empty) {
                        agencyData = querySnapshot.docs[0].data();
                        //console.log('Agency data found:', agencyData);
                        agencies.push({
                            idAgence: agencyData.idAgence,
                            nomAgence: agencyData.nomAgence
                        });
                    }
                    else {
                        console.log('No agency found with ID:', agencyId);
                    }
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: 
                //console.log('All agencies fetched:', agencies);
                return [2 /*return*/, agencies];
                case 6:
                    error_2 = _a.sent();
                    console.error('Error fetching agencies:', error_2);
                    return [2 /*return*/, []];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetches all programs for a given agency ID.
 * If the agency ID is "ALL", fetches all programs.
 * @param agencyId The ID of the agency
 * @returns An array of programs
 */
function fetchProgramsByAgencyId(agencyId) {
    return __awaiter(this, void 0, void 0, function () {
        var programsRef, q, querySnapshot, programs, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('fetchProgramsByAgencyId for agency ID:', agencyId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    programsRef = (0, firestore_1.collection)(firebase_1.db, 'programmes');
                    q = void 0;
                    if (agencyId === "1") {
                        // l'agence est "ALL", on récupérer tous les programmes
                        //console.log('All agency -> Fetching ALL programs');
                        q = (0, firestore_1.query)(programsRef);
                    }
                    else {
                        // filtrer par id_agence
                        //console.log('Fetching programs for agency ID:', agencyId);
                        q = (0, firestore_1.query)(programsRef, (0, firestore_1.where)('id_agence', '==', agencyId));
                    }
                    return [4 /*yield*/, (0, firestore_1.getDocs)(q)];
                case 2:
                    querySnapshot = _a.sent();
                    programs = querySnapshot.docs.map(function (doc) {
                        var data = doc.data();
                        return {
                            id_programme: data.id_programme,
                            nom_programme: data.nom_programme,
                            id_agence: data.id_agence,
                            type_gain: data.type_gain,
                            bareme: data.bareme
                        };
                    });
                    console.log('fetchProgramsByAgencyId(): ', programs);
                    return [2 /*return*/, programs];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error fetching programs:', error_3);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetches all robots from Firestore without agency filter
 * @returns An array of all programs
 */
function fetchAllRobotsByAgency(agencyId) {
    return __awaiter(this, void 0, void 0, function () {
        function removeDuplicates(robots) {
            var uniqueRobots = [];
            var seenProgramNames = new Set();
            for (var _i = 0, robots_1 = robots; _i < robots_1.length; _i++) {
                var robot = robots_1[_i];
                if (!seenProgramNames.has(robot.nom_programme)) {
                    seenProgramNames.add(robot.nom_programme);
                    uniqueRobots.push(robot);
                }
            }
            return uniqueRobots;
        }
        var programsRef, q, querySnapshot, robots, uniqueRobots, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('-- fetchAllRobotsByAgency: id_agence= ', agencyId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    programsRef = (0, firestore_1.collection)(firebase_1.db, 'programmes');
                    q = void 0;
                    if (agencyId === "1") {
                        // l'agence est "ALL", on récupérer tous les programmes
                        console.log('All agency -> Fetching ALL programs');
                        q = (0, firestore_1.query)(programsRef);
                    }
                    else {
                        // filtrer par id_agence
                        console.log('Fetching programs for agency ID:', agencyId);
                        q = (0, firestore_1.query)(programsRef, (0, firestore_1.where)('id_agence', '==', agencyId));
                    }
                    return [4 /*yield*/, (0, firestore_1.getDocs)(q)];
                case 2:
                    querySnapshot = _a.sent();
                    robots = querySnapshot.docs.map(function (doc) {
                        var data = doc.data();
                        return {
                            id_programme: data.id_programme,
                            nom_programme: data.nom_programme,
                            id_agence: data.id_agence,
                            type_gain: data.type_gain,
                            bareme: data.bareme
                        };
                    });
                    // Trier les robots : "TOUT" en premier, puis par nom
                    robots.sort(function (a, b) {
                        if (a.nom_programme === "TOUT")
                            return -1;
                        if (b.nom_programme === "TOUT")
                            return 1;
                        return a.nom_programme.localeCompare(b.nom_programme);
                    });
                    uniqueRobots = removeDuplicates(robots);
                    robots = uniqueRobots;
                    // Mettre à jour la variable globale
                    allRobotsByAgency = robots;
                    console.log('All programs fetched and stored globally:', allRobotsByAgency);
                    return [2 /*return*/, robots];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error fetching all programs:', error_4);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function fetchDataReportingByRobot(robotName, bareme, type_gain) {
    return __awaiter(this, void 0, void 0, function () {
        var querySnapshot, documents, data, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    bareme = bareme.replace(',', '.');
                    console.log('Fetching DataReportingMoisCourant for the robot:', robotName, "bareme:", bareme, 'type_gain:', type_gain);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_1.db, 'DataReportingMoisCourant'))];
                case 2:
                    querySnapshot = _a.sent();
                    console.log('(fetchDataReportingByProgram) Nb robots:', querySnapshot.size);
                    documents = querySnapshot.docs.map(function (doc) { return doc.data(); });
                    data = querySnapshot.docs
                        .map(function (doc) {
                        var docData = doc.data();
                        if (docData['NOM PROGRAMME'] === "Taxation Automatique") {
                            console.log('docData :', docData);
                        }
                        // Créer un objet avec toutes les dates du mois et leurs valeurs
                        var dateData = {};
                        var currentDate = new Date();
                        var year = currentDate.getFullYear();
                        var month = currentDate.getMonth() + 1;
                        // Pour chaque jour du mois
                        for (var i = 1; i <= 31; i++) {
                            var day = i.toString().padStart(2, '0');
                            var dateKey = "".concat(day, "/").concat(month.toString().padStart(2, '0'), "/").concat(year);
                            dateData[dateKey] = '';
                            if (docData[dateKey] && docData[dateKey] !== '') {
                                //console.log('dateKey:', dateKey, 'docData[dateKey]:', docData[dateKey], ' Robot: ', docData['AGENCE'] +"_"+docData['NOM PROGRAMME']);
                                dateData[dateKey] = bareme !== '0' && !isNaN(Number(docData[dateKey])) ? (0, Dashboard_1.formatNumber)(Number(docData[dateKey]) * Number(bareme)) : docData[dateKey];
                            }
                        }
                        return __assign(__assign({}, dateData), { AGENCE: docData.AGENCE || 'N/A', 'NOM PROGRAMME': docData['NOM PROGRAMME'] || 'N/A', 'NB UNITES DEPUIS DEBUT DU MOIS': bareme === '0' || isNaN(Number(docData['NB UNITES DEPUIS DEBUT DU MOIS'])) ? docData['NB UNITES DEPUIS DEBUT DU MOIS'] : (0, Dashboard_1.formatNumber)(Number(docData['NB UNITES DEPUIS DEBUT DU MOIS']) * Number(bareme)) || '0', 'NB UNITES MOIS N-1': bareme === '0' || isNaN(Number(docData['NB UNITES MOIS N-1'])) ? docData['NB UNITES MOIS N-1'] : (0, Dashboard_1.formatNumber)(Number(docData['NB UNITES MOIS N-1'].replace(',', '.')) * Number(bareme)) || '0', 'NB UNITES MOIS N-2': bareme === '0' || isNaN(Number(docData['NB UNITES MOIS N-2'])) ? docData['NB UNITES MOIS N-2'] : (0, Dashboard_1.formatNumber)(Number(docData['NB UNITES MOIS N-2'].replace(',', '.')) * Number(bareme)) || '0', 'NB UNITES MOIS N-3': bareme === '0' || isNaN(Number(docData['NB UNITES MOIS N-3'])) ? docData['NB UNITES MOIS N-3'] : (0, Dashboard_1.formatNumber)(Number(docData['NB UNITES MOIS N-3'].replace(',', '.')) * Number(bareme)) || '0' });
                    })
                        .filter(function (item) {
                        //console.log('Comparing:', {'Item AGENCE + NOM PROGRAMME': item['AGENCE'] +"_"+item['NOM PROGRAMME'], });
                        return item['AGENCE'] + "_" + item['NOM PROGRAMME'] === robotName;
                    });
                    console.log('return  data :', data);
                    return [2 /*return*/, data];
                case 3:
                    error_5 = _a.sent();
                    console.error('Error fetching data:', error_5);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function fetchEvolutionsByProgram(programId) {
    return __awaiter(this, void 0, void 0, function () {
        var evolutionsRef, q, querySnapshot, data, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    evolutionsRef = (0, firestore_1.collection)(firebase_1.db, 'evolutions');
                    q = (0, firestore_1.query)(evolutionsRef, (0, firestore_1.where)('Robot', '==', programId));
                    return [4 /*yield*/, (0, firestore_1.getDocs)(q)];
                case 1:
                    querySnapshot = _a.sent();
                    data = querySnapshot.docs.map(function (doc) {
                        var docData = doc.data();
                        //console.log('Evolution document data:', docData);
                        return __assign(__assign({ id: doc.id }, docData), { 'Date de la demande': docData['Date'] ? new Date(docData['Date']).toLocaleDateString('fr-FR') : '' });
                    });
                    //console.log('Processed evolutions data:', data);
                    return [2 /*return*/, data];
                case 2:
                    error_6 = _a.sent();
                    console.error('Error fetching evolutions:', error_6);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function fetchRandomQuote() {
    return __awaiter(this, void 0, void 0, function () {
        var quotesRef, querySnapshot, quotes, randomQuote, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Fetching a random quote...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    quotesRef = (0, firestore_1.collection)(firebase_1.db, 'citations');
                    return [4 /*yield*/, (0, firestore_1.getDocs)(quotesRef)];
                case 2:
                    querySnapshot = _a.sent();
                    //console.log('Quotes fetched:', querySnapshot.docs);
                    if (querySnapshot.empty) {
                        console.log('No quotes found.');
                        return [2 /*return*/, null];
                    }
                    quotes = querySnapshot.docs.map(function (doc) { return doc.data().phrase; });
                    randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                    console.log('Random quote fetched:', randomQuote);
                    return [2 /*return*/, randomQuote];
                case 3:
                    error_7 = _a.sent();
                    console.error('Error fetching random quote:', error_7);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function fetchStatuts() {
    return __awaiter(this, void 0, void 0, function () {
        var querySnapshot, data, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Fetching statuts...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_1.db, 'statut'))];
                case 2:
                    querySnapshot = _a.sent();
                    data = querySnapshot.docs.map(function (doc) {
                        var docData = doc.data();
                        return {
                            numero: docData.numero,
                            label: docData.name || docData.label || ''
                        };
                    });
                    // Trier les statuts par ordre ascendant selon le champ "numero"
                    data.sort(function (a, b) { return a.numero - b.numero; });
                    console.log('Statuts fetched:', data);
                    return [2 /*return*/, data];
                case 3:
                    error_8 = _a.sent();
                    console.error('Error fetching statuts:', error_8);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
