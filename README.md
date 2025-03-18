
Ex : Fichier : utils/dataStore.ts                                  


// Fichier dataStore.ts 
// Ce module gère la récupération et la mise en cache des données 
// provenant de Firestore. Il définit des interfaces pour représenter 
// une agence (Agency) et un robot/programme (Program).   //                                                 
// Variables globales                                                       
 // - cachedAgencies : stocke les agences déjà récupérées     
 // - cachedAllRobots, cachedRobots : stockent tous les robots et robots filtrés
 // - cachedReportingData : données de reporting pour chaque robot  
 //                                                            
 // Fonctions importantes :                                 
 // → initializeData(userId)    
 //    Entrée : userId (string)                                        ║
║ //    Opération : récupère les données utilisateur, charge les agences │
║ //    associées et les robots correspondants par appel aux fonctions     ║
║ //    loadUserAgencies et loadAllRobotsForAgencies.                     ║
║ //    Sortie : aucune (Promise), mais met à jour les variables de   ║
║ //    cache.                                                             ║
║ //                                                                      ║
║ /*                                                                    ║
║  * initializeData(userId: string)                                      ║
║  * -------------------------------------------------------------------  ║
║  * Description :                                                       ║
║  * - Cette fonction initialise le cache en récupérant les données       ║
║  *   utilisateur via fetchUserData. Ensuite, elle charge les agences    ║
║  *   associées grâce à loadUserAgencies et les robots via loadAllRobotsForAgencies. │
║  * Entrée :                                                             ║
║  *   - userId : identifiant de l'utilisateur (string)                  ║
║  * Sortie :                                                             ║
║  *   - Promise (les données sont stockées en global)               ║
║  *                                                                     ║
║  * Remarques :                                                         ║
║  * - Met à jour la variable globale isInitialized pour éviter des appels  │
║  *   répétés.                                                          ║
║  */                                                                    ║
║                                                                      ║
║ export async function initializeData(userId: string): Promise {  ║
║   if (isInitialized) return;                                           ║
║   try {                                                               ║
║     // Récupère les données utilisateur via fetchUserData              ║
║     const userData = await fetchUserData(userId);                      ║
║     if (!userData) {                                                   ║
║       throw new Error('Utilisateur non trouvé');                      ║
║     }                                                                  ║
║     // Charge les agences pour l'utilisateur et les robots correspondants ║
║     await loadUserAgencies(userData.userAgenceIds);                    ║
║     await loadAllRobotsForAgencies();                                  ║
║     isInitialized = true;                                              ║
║   } catch (error) {                                                    ║
║     console.log('Erreur lors de l'initialisation des données:', error);║
║     throw error;                                                      ║
║   }                                                                    ║
║ }                                                                      ║
╚════════════════════════════════════════════════════════════════════╝

────────────────────────────────────────────────────────────
╔════════════════════════════════════════════════════════════════════╗
║ Ex : Fichier : components/AgencySelector.tsx                        ║
║                                                                      ║
║ // ================================================================   ║
║ // Composant AgencySelector                                         ║
║ // Permet d'afficher une combolist des agences.                     ║
║ // Entrée :                                                           ║
║ // - agencies : Tableau d'objets Agency                               ║
║ // - selectedAgencyId : ID de l'agence sélectionnée                   ║
║ // - onAgencyChange : Fonction de rappel à appeler lors d'un changement║
║ //   de l'agence.                                                     ║
║ //                                                                      ║
║ /*                                                                    ║
║  * Fonctionnalité : Affichage de la combolist des agences              ║
║  * --------------------------------------------------------------------  ║
║  * 1. Vérifie si une liste d'agences est disponible ; sinon affiche un   ║
║  *    message "Aucune agence disponible".                               ║
║  * 2. Lors du changement de sélection, la fonction handleAgencyChange    ║
║  *    appelle onAgencyChange avec le nouvel ID, puis met à jour la liste  ║
║  *    des robots via getRobotsByAgency et updateRobots pour rafraîchir     ║
║  *    l'affichage dans le Dashboard.                                    ║
║  * Entrée :                                                             ║
║  *   - agencyId (string) : l'ID de l'agence sélectionnée                ║
║  * Sortie :                                                             ║
║  *   - Met à jour le parent et les robots filtrés dans le cache         ║
║  */                                                                    ║
║                                                                      ║
║ export default function AgencySelector({ agencies, selectedAgencyId, onAgencyChange }: AgencySelectorProps) {    ║
║   if (!agencies || agencies.length === 0) {                            ║
║     return Aucune agence disponible;                       ║
║   }                                                                    ║
║                                                                      ║
║   // handleAgencyChange : gère la sélection d'agence                  ║
║   const handleAgencyChange = (agencyId: string) => {                    ║
║     onAgencyChange(agencyId); // Informe le parent avec le nouvel ID    ║
║     const robots = getRobotsByAgency(agencyId); // Récupère les robots    ║
║       // Met à jour la liste des robots dans l'application              ║
║     updateRobots(robots);                                               ║
║   };                                                                   ║
║                                                                      ║
║   return (                                                             ║
║     <Select value={selectedAgencyId || undefined} onValueChange={handleAgencyChange}>  ║
║         ║
║                    ║
║           {agencies.find(a => a.idAgence === selectedAgencyId)?.libelleAgence ||  ║
║            agencies.find(a => a.idAgence === selectedAgencyId)?.nomAgence}                ║
║                                                         ║
║                                                       ║
║         ║
║         {agencies.map((agency) => {                                    ║
║           const displayText = agency.libelleAgence?.trim() || agency.nomAgence;  ║
║           return (                                                     ║
║             <SelectItem                                                      ║
║               key={agency.idAgence}                                            ║
║               value={agency.idAgence}                                          ║
║               className="text-sm hover:bg-gray-100"                           ║
║             >                                                                  ║
║               {displayText}                                                  ║
║                                                                 ║
║           );                                                                  ║
║         })}                                                                   ║
║                                                               ║
║                                                                      ║
║   );                                                                           ║
║ }                                                                              ║
╚════════════════════════════════════════════════════════════════════╝

────────────────────────────────────────────────────────────
╔════════════════════════════════════════════════════════════════════╗
║ Ex : Fichier : components/MergedRequestForm.tsx                     ║
║                                                                      ║
║ // ================================================================   ║
║ // Composant MergedRequestForm                                      ║
║ // Ce formulaire gère trois cas d'utilisation : création d'une       ║
║ // nouvelle demande, demande d'évolution, et édition d'une demande.   ║
║ //                                                                      ║
║ // Entrées :                                                          ║
║ // - onClose : Fonction pour fermer le formulaire                     ║
║ // - type : le type de formulaire ('new', 'evolution', 'edit')         ║
║ // - typeGain : type de gain (ex. 'temps')                              ║
║ // - user : informations sur l'utilisateur                             ║
║ // - formData : données initiales du formulaire                        ║
║ //                                                                      ║
║ /*                                                                    ║
║  * Fonction handleSubmit :                                            ║
║  * --------------------------------------------------------------------  ║
║  * - Valide les champs obligatoires (Intitulé, Description).            ║
║  * - Vérifie si des modifications ont été apportées par rapport aux données initiales.   ║
║  * - Si les validations sont réussies, appelle submitForm qui            ║
║  *   envoie les données à Firestore (collection 'evolutions') et appelle      ║
║  *   l'API d'envoi d'e-mail (endpoint '/api/contact').                    ║
║  * Entrées :                                                             ║
║  *   - formDataState : État local du formulaire                           ║
║  * Sortie :                                                              ║
║  *   - Processus asynchrone d'envoi des données, indication de succès ou   ║
║  *     échec via les toasts.                                             ║
║  */                                                                    ║
║                                                                      ║
║ // Les états isLoading, isSuccess servent à gérer l'UX pendant la soumission   ║
║ // et les valeurs de formDataState contiennent les données saisies par l'utilisateur.  ║
║ // La fonction submitForm effectue en deux temps :                        ║
║ // 1. L'ajout d'un document dans Firestore avec addDoc                       ║
║ // 2. Une requête POST vers '/api/contact' pour notifier par e-mail l'envoi  ║
║ // En cas d'erreur, un toast d'erreur est affiché.                         ║
║                                                                      ║
║ export default function MergedRequestForm({ onClose, type, typeGain, user, formData = { ... } }: MergedRequestFormProps) {  ║
║   // Initialisation des états locaux (formDataState, isLoading, etc.)  ║
║   const [formDataState, setFormData] = useState({ ...formData });       ║
║   const [isLoading, setIsLoading] = useState(false);                   ║
║   // useEffect charge les statuts pour le sélecteur si l'utilisateur est admin                                   ║
║   useEffect(() => {                                                     ║
║     const loadStatuts = async () => {                                  ║
║       const statutsData = await fetchStatuts();                        ║
║       setStatuts(statutsData);                                           ║
║     };                                                                 ║
║     loadStatuts();                                                     ║
║   }, []);                                                              ║
║   // handleChange met à jour formDataState lors de la saisie dans les Input                               ║
║   const handleChange = (e) => {                                         ║
║     const { name, value } = e.target;                                  ║
║     setFormData(prev => ({ ...prev, [name]: value }));                  ║
║   };                                                                   ║
║   // handleSubmit effectue la validation et envoie le formulaire         ║
║   const handleSubmit = async (e) => {                                  ║
║     e.preventDefault();                                                ║
║     setIsLoading(true);                                                ║
║     // Valider les champs obligatoires                                  ║
║     if (!formDataState.Intitulé.trim() || !formDataState.Description.trim()) {   ║
║       // Affiche un toast d'erreur si vacants                           ║
║       toast({ title: "Erreur", description: "Intitulé et Description obligatoires", variant: "destructive" });  ║
║       return;                                                          ║
║     }                                                                  ║
║     // Soumission via submitForm : ajoute à Firestore et notifie par e-mail                                          ║
║     await submitForm();                                                ║
║   };                                                                   ║
║   // submitForm effectue l'ajout de données dans Firestore et l'envoi d'e-mail                                             ║
║   const submitForm = async () => {                                     ║
║     // Prépare les données et appelle addDoc                             ║
║     // Puis appelle l'API pour envoyer un e-mail                          ║
║   };                                                                   ║
║   return ( ... JSX affichant le formulaire dans un Dialog ... );        ║
║ }                                                                      ║
╚════════════════════════════════════════════════════════════════════╝

────────────────────────────────────────────────────────────
╔════════════════════════════════════════════════════════════════════╗
║ Synthèse globale de l'architecture et du flux de données             ║
║                                                                      ║
║  • Couche donnée :                                                 ║
║      – dataStore.ts et dataFetcher.ts s'occupent de récupérer et     ║
║        mettre en cache les données depuis Firestore.                ║
║      – Les fonctions comme initializeData, loadUserAgencies,         ║
║        loadAllRobotsForAgencies assurent que ces données sont          ║
║        disponibles en global pour l’application.                     ║
║                                                                      ║
║  • Couche logique (Dashboard.tsx) :                                 ║
║      – Gère la redirection si l'utilisateur n'est pas connecté.       ║
║      – Initialise les données utilisateur et met à jour les sélections║
║        d'agences, services et robots.                                ║
║      – Transmet ensuite les données aux composants graphiques et tabulaires.   ║
║                                                                      ║
║  • Couche UI (composants graphiques et de sélection) :              ║
║      – Chart.tsx, Chart4All.tsx, Chart4Service.tsx affichent les        ║
║        statistiques sous forme de graphiques.                        ║
║      – ProgramSelector, AgencySelector et ServiceSelector gèrent       ║
║        la sélection et le filtrage des données, par exemple pour        ║
║        "afficher la combolist des agences", AgencySelector utilise      ║
║        onAgencyChange, getRobotsByAgency, et updateRobots pour rafraîchir.  ║
║                                                                      ║
║  • Couche formulaire (MergedRequestForm.tsx et ProgramTable.tsx) :    ║
║      – MergedRequestForm.tsx permet de créer, éditer ou demander        ║
║        une évolution pour un robot.                                  ║
║      – ProgramTable.tsx affiche l'historique des évolutions et permet  ║
║        d'ouvrir ces formulaires en mode "evolution" ou "edit".         ║
║                                                                      ║
║ Chaque fonction et variable est commentée pour expliquer en détails :  ║
║ - Les entrées attendues et leur format                                ║
║ - Les sorties produites, ou les effets secondaires (mise à jour du cache, affichage, etc.)  ║
║ - Le rôle de la fonction dans le flux global de l’application           ║
║                                                                      ║
║ Ces commentaires améliorés facilitent la maintenance et l’évolution   ║
║ future de l’application en donnant aux développeurs un aperçu clair des │
║ mécanismes en place et de leurs interactions.                         ║
╚════════════════════════════════════════════════════════════════════╝