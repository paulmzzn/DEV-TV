const chrono = require('chrono-node');
const moment = require('moment');
require('moment/locale/fr');

moment.locale('fr');

function extractDates(text) {
    if (!text) return null;

    // Patterns courants de dates en français
    const datePatterns = [
        /(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?/,  // 08/01, 08/01/24, 08-01
        /(\d{1,2})\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i,  // 8 janvier
        /(\d{1,2})\s*(janv|fév|mars|avr|mai|juin|juil|août|sept|oct|nov|déc)/i  // 8 janv
    ];

    // 1. Essayer d'abord chrono-node
    const chronoResult = chrono.fr.parse(text);
    if (chronoResult.length > 0) {
        return chronoResult[0].start.date();
    }

    // 2. Chercher des patterns spécifiques
    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            let date;
            if (match[2] && isNaN(match[2])) {
                // Format avec mois en texte
                date = moment(text, ['D MMMM', 'D MMM']);
            } else {
                // Format numérique
                const day = match[1];
                const month = match[2];
                const year = match[3] || moment().year(); // Année courante si non spécifiée
                
                date = moment(`${day}/${month}/${year}`, 'DD/MM/YYYY');
            }

            if (date.isValid()) {
                // Si la date est dans le passé, on suppose qu'elle est pour l'année suivante
                if (date.isBefore(moment(), 'day')) {
                    date.add(1, 'year');
                }
                return date.toDate();
            }
        }
    }

    return null;
}

function calculatePriority(date) {
    if (!date) return null; // Retourne null au lieu d'une priorité par défaut
    
    const now = moment();
    const targetDate = moment(date);
    const diffDays = targetDate.diff(now, 'days');
    
    if (diffDays <= 3) return '5';
    if (diffDays <= 7) return '4';
    if (diffDays <= 11) return '3';
    if (diffDays <= 20) return '2';
    return '1';
}

module.exports = { extractDates, calculatePriority };
