function addParticipant() {
    const table = document.getElementById("investment-table").getElementsByTagName('tbody')[0];
    const row = table.insertRow();

    for (let i = 0; i < 9; i++) {
        const cell = row.insertCell(i);
        if (i === 0) {
            cell.innerHTML = '<input type="text" oninput="updateTable()">';
            cell.setAttribute('data-label', 'NOM');
        } else if (i === 1) {
            cell.innerHTML = '<input type="number" value="0" oninput="updateTable()">';
            cell.setAttribute('data-label', 'Investissement');
        } else if (i === 8) {
            cell.innerHTML = '<button onclick="deleteParticipant(this)">Supprimer</button>';
            cell.setAttribute('data-label', 'Action');
        } else {
            cell.innerHTML = '<span>0</span>';
            switch (i) {
                case 2: cell.setAttribute('data-label', 'Investissement Conseillé'); break;
                case 3: cell.setAttribute('data-label', 'Pourcentage'); break;
                case 4: cell.setAttribute('data-label', 'VENTE INITIAL'); break;
                case 5: cell.setAttribute('data-label', 'VENTE BONUS'); break;
                case 6: cell.setAttribute('data-label', 'BÉNÉFICE'); break;
                case 7: cell.setAttribute('data-label', 'AUEC/HEURE'); break;
            }
        }
    }

    updateTable();
}

function deleteParticipant(button) {
    const row = button.parentElement.parentElement;
    row.remove();
    updateTable();
}

function formatNumber(num) {
    return num.toLocaleString('fr-FR');
}

function parseNumber(str) {
    return parseFloat(str.replace(/\s/g, '').replace(',', '.')) || 0;
}

function updateTable() {
    const table = document.getElementById("investment-table");
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    let totalInvestment = 0;
    let percentages = [];
    let totalProfit = 0;
    let totalHourlyProfit = 0;

    // Calculate total investment
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('input');
        const investment = parseNumber(cells[1].value);
        totalInvestment += investment;
    }

    const totalRecommendedInvestment = parseNumber(document.getElementById('total-recommended-investment').value);
    const totalInitialSale = parseNumber(document.getElementById('total-initial-sale').value);
    const totalBonusSale = parseNumber(document.getElementById('total-bonus-sale').value);
    const recommendedInvestmentPerParticipant = Math.floor(totalRecommendedInvestment / (rows.length || 1));
    const bonusSalePerParticipant = Math.floor((totalBonusSale / (rows.length || 1)) * 0.995);

    // Calculate percentages
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('input');
        const investment = parseNumber(cells[1].value);
        let percentage = (investment / totalInvestment) * 100 || 0;
        percentages.push(percentage);
    }

    // Adjust percentages to sum to 100%
    let totalPercentage = Math.round(percentages.reduce((a, b) => a + b, 0));
    let difference = 100 - totalPercentage;

    for (let i = 0; difference !== 0 && i < rows.length; i++) {
        if (difference > 0) {
            percentages[i] = Math.ceil(percentages[i]);
            difference--;
        } else if (difference < 0) {
            percentages[i] = Math.floor(percentages[i]);
            difference++;
        }
    }

    // Update table rows
    const durationText = document.getElementById('duration').textContent;
    const durationParts = durationText.split(':');
    const totalDurationInHours = parseFloat(durationParts[0]) + (parseFloat(durationParts[1]) / 60);

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('input');
        const spans = rows[i].getElementsByTagName('span');
        const investment = parseNumber(cells[1].value);
        const percentage = percentages[i];
        const initialSaleShare = Math.floor((totalInitialSale * percentage / 100) * 0.995);
        const profit = initialSaleShare + bonusSalePerParticipant - investment;
        const hourlyProfit = totalDurationInHours ? (profit / totalDurationInHours) : 0;

        spans[0].textContent = formatNumber(recommendedInvestmentPerParticipant);
        spans[1].textContent = Math.round(percentage);
        spans[2].textContent = formatNumber(initialSaleShare);
        spans[3].textContent = formatNumber(bonusSalePerParticipant);
        spans[4].textContent = formatNumber(profit);
        spans[5].textContent = formatNumber(Math.floor(hourlyProfit - investment / totalDurationInHours));

        totalProfit += profit;
        totalHourlyProfit += hourlyProfit - (investment / totalDurationInHours);
    }

    // Update footer totals
    document.getElementById('total-investment').textContent = formatNumber(totalInvestment);
    document.getElementById('total-percentage').textContent = formatNumber(100);
    document.getElementById('total-profit').textContent = formatNumber(totalProfit);
    document.getElementById('total-hourly-profit').textContent = formatNumber(Math.floor(totalHourlyProfit));
}

function calculateDuration() {
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;

    if (startTime && endTime) {
        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);
        const durationInMinutes = (end - start) / (1000 * 60); // duration in minutes
        const hours = Math.floor(durationInMinutes / 60);
        const minutes = Math.round(durationInMinutes % 60);

        document.getElementById('duration').textContent = `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

        updateTable(); // Recalculate table after updating duration
    }
}

