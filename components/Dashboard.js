'use client';
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNumber = void 0;
exports.default = Dashboard;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var ProgramSelector_1 = require("./ProgramSelector");
var Chart_1 = require("./Chart");
var ProgramTable_1 = require("./ProgramTable");
var Chart4All_1 = require("./Chart4All");
var MergedRequestForm_1 = require("./MergedRequestForm");
var AgencySelector_1 = require("./AgencySelector");
var image_1 = require("next/image");
var dataFetcher_1 = require("../utils/dataFetcher");
// Fonction pour formater les nombres 
// export const formatNumber = (num: number) => {
//   if (Number.isInteger(num)) {
//     return num.toString();
//   } else {
//     let formatted = num.toFixed(2);
//     //console.log('formatted:', formatted);
//     formatted = formatted.endsWith('.00') ? formatted.slice(0, -3) : formatted;
//     return formatted;
//   }
// };
// Fonction pour formater les nombres 
var formatNumber = function (num) {
    if (Number.isInteger(num)) {
        return num.toString();
    }
    else {
        // Séparer partie entière et décimale
        var _a = num.toFixed(2).split('.'), entier = _a[0], decimal = _a[1];
        // Convertir la partie décimale en base 60 (minutes)
        var minutes = Math.round(Number(decimal) * 0.6);
        // Formater les minutes avec 2 chiffres
        var formattedMinutes = String(minutes).padStart(2, '0');
        return "".concat(entier, ",").concat(formattedMinutes);
    }
};
exports.formatNumber = formatNumber;
function Dashboard() {
    var _this = this;
    var searchParams = (0, navigation_1.useSearchParams)();
    var username = searchParams.get('user') || '';
    var _a = (0, react_1.useState)([]), agencies = _a[0], setAgencies = _a[1];
    var _b = (0, react_1.useState)(null), selectedAgency = _b[0], setSelectedAgency = _b[1];
    var _c = (0, react_1.useState)([]), programs = _c[0], setPrograms = _c[1];
    var _d = (0, react_1.useState)(null), selectedRobot = _d[0], setSelectedRobot = _d[1];
    var _e = (0, react_1.useState)(null), selectedRobotData = _e[0], setSelectedRobotData = _e[1];
    var _f = (0, react_1.useState)([]), historiqueData = _f[0], setHistoriqueData = _f[1];
    var _g = (0, react_1.useState)(null), robotData = _g[0], setRobotData = _g[1];
    var _h = (0, react_1.useState)(null), robotData1 = _h[0], setRobotData1 = _h[1];
    var _j = (0, react_1.useState)(null), robotData2 = _j[0], setRobotData2 = _j[1];
    var _k = (0, react_1.useState)(null), error = _k[0], setError = _k[1];
    var _l = (0, react_1.useState)(true), isLoading = _l[0], setIsLoading = _l[1];
    var _m = (0, react_1.useState)(false), OpenFormNewOrder = _m[0], setIsFormOpen = _m[1];
    var _o = (0, react_1.useState)(true), useChart4All = _o[0], setUseChart4All = _o[1];
    var router = (0, navigation_1.useRouter)();
    var user = searchParams.get('user');
    (0, react_1.useEffect)(function () {
        if (!user) {
            router.replace('/');
        }
    }, [user, router]);
    // Fetch user data and agencies
    (0, react_1.useEffect)(function () {
        var loadUserData = function () { return __awaiter(_this, void 0, void 0, function () {
            var userData, userAgencies, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        setIsLoading(true);
                        return [4 /*yield*/, (0, dataFetcher_1.fetchUserIdByUsername)(username)];
                    case 1:
                        userData = _a.sent();
                        if (!userData) {
                            setError('Utilisateur non trouvé');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, (0, dataFetcher_1.fetchAgenciesByIds)(userData.userAgenceIds)];
                    case 2:
                        userAgencies = _a.sent();
                        setAgencies(userAgencies);
                        if (userAgencies.length > 0) {
                            setSelectedAgency(userAgencies[0]);
                        }
                        setIsLoading(false);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Erreur lors du chargement des données:', error_1);
                        setError('Erreur lors du chargement des données');
                        setIsLoading(false);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        if (username) {
            loadUserData();
        }
    }, [username]);
    // Fetch programs when selected agency changes
    (0, react_1.useEffect)(function () {
        var loadPrograms = function () { return __awaiter(_this, void 0, void 0, function () {
            var agencyPrograms, defaultProgram;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!selectedAgency) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, dataFetcher_1.fetchAllRobotsByAgency)(selectedAgency.idAgence)];
                    case 1:
                        agencyPrograms = _a.sent();
                        console.log('Programs loaded:', agencyPrograms);
                        setPrograms(agencyPrograms);
                        if (agencyPrograms.length > 0) {
                            defaultProgram = agencyPrograms[0];
                            setSelectedRobot(defaultProgram);
                            // Use the exact program name for searching in Firebase
                            console.log('Setting program data with name:', defaultProgram.nom_programme);
                            setSelectedRobotData(defaultProgram);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        console.log('No agency selected, clearing programs');
                        setPrograms([]);
                        setSelectedRobot(null);
                        setSelectedRobotData(null);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        loadPrograms();
    }, [selectedAgency]);
    (0, react_1.useEffect)(function () {
        /**
         * Loads data for the selected program (robot). If the selected program is "TOUT",
         * loads data for all robots of the selected agency and merges their values (day by day) into a single
         * DataEntry object. Otherwise, loads data for the single selected program.
         * @returns {Promise<void>}
         */
        var loadProgramData = function () { return __awaiter(_this, void 0, void 0, function () {
            var allHistorique, arrJoursDuMois, arrJoursDuMois_Type1, arrJoursDuMois_Type2, rawData, totalUnitesMoisCourant_Type1, totalUnitesMoisN1_Type1, totalUnitesMoisN2_Type1, totalUnitesMoisN3_Type1, totalUnitesMoisCourant_Type2, totalUnitesMoisN1_Type2, totalUnitesMoisN2_Type2, totalUnitesMoisN3_Type2, currentDate, currentMonth, currentYear, _loop_1, _i, programs_1, robot, mergedDataType1, mergedDataType2, i, dateKey, baremeValue, data, historique;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!selectedRobotData) return [3 /*break*/, 8];
                        console.log('Loading data for robot :', selectedRobotData);
                        if (!(selectedRobotData.nom_programme === "TOUT")) return [3 /*break*/, 5];
                        allHistorique = [];
                        arrJoursDuMois = new Array(31).fill("0");
                        arrJoursDuMois_Type1 = __spreadArray([], arrJoursDuMois, true);
                        arrJoursDuMois_Type2 = __spreadArray([], arrJoursDuMois, true);
                        rawData = [];
                        totalUnitesMoisCourant_Type1 = 0;
                        totalUnitesMoisN1_Type1 = 0;
                        totalUnitesMoisN2_Type1 = 0;
                        totalUnitesMoisN3_Type1 = 0;
                        totalUnitesMoisCourant_Type2 = 0;
                        totalUnitesMoisN1_Type2 = 0;
                        totalUnitesMoisN2_Type2 = 0;
                        totalUnitesMoisN3_Type2 = 0;
                        currentDate = new Date();
                        currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
                        currentYear = currentDate.getFullYear();
                        _loop_1 = function (robot) {
                            var currentProgram, robotType, _b, rawData_1, entry, i, dateKey, value, idx, sommeDeCetteDate, historique;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0: return [4 /*yield*/, (0, dataFetcher_1.fetchDataReportingByRobot)(robot.nom_programme, robot.bareme, robot.type_gain)];
                                    case 1:
                                        // Récupère les données du robot
                                        //rawData = await fetchDataReportingByProgram(robot.nom_programme, robot.bareme);
                                        rawData = (_c.sent()).map(function (entry) { return (__assign(__assign({}, entry), { 'NB UNITES DEPUIS DEBUT DU MOIS': String(entry['NB UNITES DEPUIS DEBUT DU MOIS']), 'NB UNITES MOIS N-1': String(entry['NB UNITES MOIS N-1']), 'NB UNITES MOIS N-2': String(entry['NB UNITES MOIS N-2']), 'NB UNITES MOIS N-3': String(entry['NB UNITES MOIS N-3']) })); });
                                        // Vérifier si rawData existe et contient des éléments
                                        if (!rawData || rawData.length === 0) {
                                            return [2 /*return*/, "continue"];
                                        }
                                        if (!(robot.id_agence === (selectedAgency === null || selectedAgency === void 0 ? void 0 : selectedAgency.idAgence) && robot.nom_programme !== "TOUT")) return [3 /*break*/, 3];
                                        currentProgram = programs.find(function (p) { return p.nom_programme === robot.nom_programme; });
                                        robotType = currentProgram === null || currentProgram === void 0 ? void 0 : currentProgram.type_gain;
                                        for (_b = 0, rawData_1 = rawData; _b < rawData_1.length; _b++) {
                                            entry = rawData_1[_b];
                                            if (robotType === 'temps') {
                                                totalUnitesMoisCourant_Type1 += Number(entry['NB UNITES DEPUIS DEBUT DU MOIS']) || 0;
                                                totalUnitesMoisN1_Type1 += Number(entry['NB UNITES MOIS N-1']) || 0;
                                                totalUnitesMoisN2_Type1 += Number(entry['NB UNITES MOIS N-2']) || 0;
                                                totalUnitesMoisN3_Type1 += Number(entry['NB UNITES MOIS N-3']) || 0;
                                            }
                                            else if (robotType === 'autre') {
                                                totalUnitesMoisCourant_Type2 += Number(entry['NB UNITES DEPUIS DEBUT DU MOIS']) || 0;
                                                totalUnitesMoisN1_Type2 += Number(entry['NB UNITES MOIS N-1']) || 0;
                                                totalUnitesMoisN2_Type2 += Number(entry['NB UNITES MOIS N-2']) || 0;
                                                totalUnitesMoisN3_Type2 += Number(entry['NB UNITES MOIS N-3']) || 0;
                                            }
                                            for (i = 1; i <= 31; i++) {
                                                dateKey = i.toString().padStart(2, '0') + '/' + currentMonth + '/' + currentYear;
                                                if (entry[dateKey]) {
                                                    value = entry[dateKey];
                                                    idx = i - 1;
                                                    sommeDeCetteDate = arrJoursDuMois[idx];
                                                    if (robotType === 'temps') {
                                                        arrJoursDuMois_Type1[idx] = "".concat(Number(sommeDeCetteDate.replace(',', '.')) + Number(value.replace(',', '.')));
                                                    }
                                                    else if (robotType === 'autre') {
                                                        arrJoursDuMois_Type2[idx] = "".concat(Number(sommeDeCetteDate) + Number(value));
                                                    }
                                                }
                                            }
                                        }
                                        return [4 /*yield*/, (0, dataFetcher_1.fetchEvolutionsByProgram)(robot.nom_programme)];
                                    case 2:
                                        historique = _c.sent();
                                        allHistorique.push.apply(allHistorique, historique);
                                        _c.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, programs_1 = programs;
                        _a.label = 1;
                    case 1:
                        if (!(_i < programs_1.length)) return [3 /*break*/, 4];
                        robot = programs_1[_i];
                        return [5 /*yield**/, _loop_1(robot)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        mergedDataType1 = __assign(__assign({}, rawData[0]), { 'NB UNITES DEPUIS DEBUT DU MOIS': (0, exports.formatNumber)(totalUnitesMoisCourant_Type1), 'NB UNITES MOIS N-1': (0, exports.formatNumber)(totalUnitesMoisN1_Type1), 'NB UNITES MOIS N-2': (0, exports.formatNumber)(totalUnitesMoisN2_Type1), 'NB UNITES MOIS N-3': (0, exports.formatNumber)(totalUnitesMoisN3_Type1) });
                        mergedDataType2 = __assign(__assign({}, rawData[0]), { 'NB UNITES DEPUIS DEBUT DU MOIS': (0, exports.formatNumber)(totalUnitesMoisCourant_Type2), 'NB UNITES MOIS N-1': (0, exports.formatNumber)(totalUnitesMoisN1_Type2), 'NB UNITES MOIS N-2': (0, exports.formatNumber)(totalUnitesMoisN2_Type2), 'NB UNITES MOIS N-3': (0, exports.formatNumber)(totalUnitesMoisN3_Type2) });
                        for (i = 1; i <= 31; i++) {
                            dateKey = i.toString().padStart(2, '0') + '/' + currentMonth + '/' + currentYear;
                            mergedDataType1[dateKey] = arrJoursDuMois_Type1[i - 1];
                            mergedDataType2[dateKey] = arrJoursDuMois_Type2[i - 1];
                        }
                        setRobotData1(mergedDataType1);
                        setRobotData2(mergedDataType2);
                        setHistoriqueData(allHistorique);
                        setUseChart4All(true);
                        return [3 /*break*/, 8];
                    case 5:
                        setUseChart4All(false);
                        baremeValue = selectedRobotData.bareme === '' || selectedRobotData.bareme === '0' ? '0' : selectedRobotData.bareme;
                        return [4 /*yield*/, (0, dataFetcher_1.fetchDataReportingByRobot)(selectedRobotData.nom_programme, baremeValue, selectedRobotData.type_gain)];
                    case 6:
                        data = _a.sent();
                        setRobotData(data[0]);
                        return [4 /*yield*/, (0, dataFetcher_1.fetchEvolutionsByProgram)(selectedRobotData.nom_programme)];
                    case 7:
                        historique = _a.sent();
                        setHistoriqueData(historique);
                        _a.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        }); };
        loadProgramData();
    }, [selectedRobotData]);
    var handleAgencyChange = function (agencyId) {
        var agency = agencies.find(function (a) { return a.idAgence === agencyId; });
        setSelectedAgency(agency || null);
    };
    var handleProgramChange = function (programId) {
        var program = programs.find(function (p) { return p.id_programme === programId; });
        if (program && selectedAgency) {
            setSelectedRobot(program);
            // Use the exact program name for searching in Firebase
            console.log('(Dashboard.tsx) Setting program data with name:', program.nom_programme);
            setSelectedRobotData(program);
        }
    };
    var handleOpenForm = function () {
        setIsFormOpen(true);
    };
    var handleCloseForm = function () {
        setIsFormOpen(false);
    };
    if (error) {
        return <div className="text-red-500">{error}</div>;
    }
    if (!user) {
        return null;
    }
    return (<>
      <div>
        <image_1.default src="/logo_bbl-groupe2.png" alt="Logo BBL Groupe" width={100} height={70}/>
        <div className="flex bg-x-100 container mx-auto">
          <div className="ml-5  bg-x-100">
            <span className="text-black flex">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 mr-2 text-gray-600">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
            </svg> {user}</span>
            <div className="flex space-x-8 mt-2">
              <div className="flex items-center space-x-2">
                <span>Agence:</span>
                <AgencySelector_1.default agencies={agencies} selectedAgencyId={(selectedAgency === null || selectedAgency === void 0 ? void 0 : selectedAgency.idAgence) || ''} onAgencyChange={handleAgencyChange}/>
              </div>
              <div className="flex items-center space-x-2">
                <span>Robot:</span>
                <ProgramSelector_1.default programs={programs} selectedProgramId={(selectedRobot === null || selectedRobot === void 0 ? void 0 : selectedRobot.id_programme) || ''} onProgramChange={handleProgramChange}/>
                <div className=" bg-red-100"></div>    
                <div className="flex justify-end bg-x-100 h-[40px]">
                  <button onClick={handleOpenForm} className="bg-neutral-950 text-neutral-100 border border-neutral-400 border-b-4 font-medium overflow-hidden relative px-4 py-1 rounded-lg hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                    <span className="bg-neutral-400 shadow-neutral-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] roundedlg opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_5px_5px_rgba(0,0,0,0.3)]"></span>
                    Nouvelle Demande
                  </button>
                </div>               
              </div>
            </div>
          </div>
        </div>
      </div>

      {OpenFormNewOrder &&
            <MergedRequestForm_1.default onClose={handleCloseForm} type="new" formData={{
                    Intitulé: '',
                    Description: '',
                    Robot: selectedRobot ? selectedRobot.nom_programme : '',
                    Temps_consommé: '',
                    Nb_operations_mensuelles: '',
                    Statut: '1', // Par défaut "En attente de validation"
                    Date: new Date().toISOString(),
                    type: 'new'
                }}/>}

      <div className="container mx-auto min-h-screen bg-x-100">
        {selectedRobot && (<div className="p-4 bg-x-200">
            <div className="grid grid-cols-4 gap-4 bg-x-100">
              <div className="col-span-4 pb-8">
               {useChart4All ? (<Chart4All_1.default robotType={selectedRobot === null || selectedRobot === void 0 ? void 0 : selectedRobot.type_gain} data1={robotData1} data2={robotData2}/>) : ('')}
                {robotData && !useChart4All ? (<Chart_1.default robotType={selectedRobot === null || selectedRobot === void 0 ? void 0 : selectedRobot.type_gain} data={robotData}/>) : ('')}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 bg-x-300 mt-5">
              <div className="col-span-4 w-full">
                <ProgramTable_1.default robot={(selectedRobot === null || selectedRobot === void 0 ? void 0 : selectedRobot.nom_programme) || ''} data={historiqueData} useChart4All={useChart4All}/>
              </div>
            </div>
          </div>)}
      </div>
    </>);
}
