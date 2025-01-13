import { formatNumber } from './components/Dashboard.js';

console.log(formatNumber(1.5)); // Devrait afficher "1:30"
console.log(formatNumber(2.25)); // Devrait afficher "2:15" 
console.log(formatNumber(3.0)); // Devrait afficher "3:00"
