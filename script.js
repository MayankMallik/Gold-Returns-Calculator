// Indian numbering system formatting logic
const formatToWords = num => {
    if (num >= 10000000) { // Crore
        const value = Math.ceil((num / 10000000) * 100) / 100;
        return `₹${value.toFixed(2)} Crore`;
    } else if (num >= 100000) { // Lakh
        const value = Math.ceil((num / 100000) * 100) / 100;
        return `₹${value.toFixed(2)} Lakh`;
    } else {
        let integer = Math.ceil(num).toString();
        if (integer.length > 3) {
            let lastThree = integer.slice(-3);
            let otherNumbers = integer.slice(0, -3);
            otherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
            integer = otherNumbers + "," + lastThree;
        }
        return "₹" + integer;
    }
};

function initYears() {
    const pYear = document.getElementById('pYear');
    const sYear = document.getElementById('sYear');
    const currentYear = new Date().getFullYear(); 
    const startYear = 1960; 
    const futureLimit = currentYear + 10; 

    for (let i = futureLimit; i >= startYear; i--) {
        let opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = i;
        pYear.appendChild(opt.cloneNode(true));
        sYear.appendChild(opt);
    }
}

function formatNumber(input) {
    let value = input.value.replace(/,/g, '');
    value = value.replace(/[^0-9.]/g, ''); 
    if (value.length > 3) {
        let parts = value.split('.');
        let integer = parts[0];
        let decimal = parts.length > 1 ? '.' + parts[1] : '';
        let lastThree = integer.slice(-3);
        let otherNumbers = integer.slice(0, -3);
        if (otherNumbers) {
            otherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
            integer = otherNumbers + "," + lastThree;
        }
        value = integer + decimal;
    }
    input.value = value;
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function() { 
        formatNumber(this); 
        this.classList.remove('error');
    });
});

function calculate() {
    const required = ['goldWeight', 'purchaseRate', 'makingCharges', 'saleRate', 'pYear', 'pMonth', 'sYear', 'sMonth'];
    let isValid = true;

    required.forEach(id => {
        const el = document.getElementById(id);
        if (!el.value) {
            el.classList.add('error');
            isValid = false;
        } else {
            el.classList.remove('error');
        }
    });

    if (!isValid) return;

    const getVal = id => parseFloat(document.getElementById(id).value.replace(/,/g, '')) || 0;
    
    // Updated Logic
    const weight = getVal('goldWeight');
    const purchaseRate = getVal('purchaseRate');
    const makingCharges = getVal('makingCharges');
    const gstPercent = getVal('gstAmount'); // Now treated as %

    // 1. Calculate base purchase value
    const baseValue = (weight * purchaseRate) + makingCharges;
    
    // 2. Calculate GST amount (Base Value * GST%)
    const gstCalculated = baseValue * (gstPercent / 100);
    
    // 3. Total Investment
    const totalOutflow = baseValue + gstCalculated;
    
    // Total Inflow = (Weight * Sale Rate) - Sale Charges
    const totalInflow = (weight * getVal('saleRate')) - getVal('saleBrokerage');

    const startMonth = parseInt(document.getElementById('pMonth').value);
    const startYear = parseInt(document.getElementById('pYear').value);
    const endMonth = parseInt(document.getElementById('sMonth').value);
    const endYear = parseInt(document.getElementById('sYear').value);

    let totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth);
    const t = totalMonths / 12;

    if (t <= 0) {
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('results').style.display = 'none';
        return;
    } else {
        document.getElementById('error-message').style.display = 'none';
    }

    // CAGR Formula
    const annualValue = (Math.pow((totalInflow / totalOutflow), (1 / t)) - 1) * 100;
    const realValue = annualValue - 6;

    document.getElementById('totalInvestment').innerText = formatToWords(totalOutflow);
    document.getElementById('totalSale').innerText = formatToWords(totalInflow);
    
    document.getElementById('annualReturns').innerText = annualValue.toFixed(2) + "%";
    document.getElementById('annualReturns').style.color = annualValue >= 0 ? "#28a745" : "#d9534f";

    document.getElementById('realReturns').innerText = realValue.toFixed(2) + "%";
    document.getElementById('realReturns').style.color = realValue >= 0 ? "#28a745" : "#d9534f";

    document.getElementById('results').style.display = 'block';
}

initYears();