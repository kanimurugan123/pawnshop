
function calcLoan() {
  let gram = +document.getElementById("gram").value;
  let rate = +document.getElementById("rate").value;
  let interest = +document.getElementById("interest").value;
  let type = document.getElementById("type").value;

  if (gram <= 0 || rate <= 0 || interest <= 0 || type === "") {
    document.getElementById("result").innerHTML = 
      "<span class='text-danger'>அனைத்து விவரங்களையும் சரியாக உள்ளிடவும்</span>";
    return;
  }

  let loanAmount = gram * rate;
  let period = (type === "monthly") ? 12 : 52;
  let totalInterest = interest * period;
  let totalAmount = loanAmount + totalInterest;
  let perPay = totalAmount / period;
  let label = (type === "monthly") ? "மாதம்" : "வாரம்";

  document.getElementById("result").innerHTML = `
    <b>💰 கடன் தொகை:</b> ₹ ${loanAmount.toLocaleString()}<br>
    <b>📈 மொத்த வட்டி:</b> ₹ ${totalInterest.toLocaleString()}<br>
    <b>📊 மொத்தம்:</b> ₹ ${totalAmount.toLocaleString()}<br>
    <b class="text-success">👉 ஒவ்வொரு ${label} கட்டணம்: ₹ ${perPay.toFixed(0).toLocaleString()}</b><br>
    <b>🗓️ கால அளவு:</b> ${period} ${label}
  `;
}

async function fetchGoldRate() {
  try {
    let today = new Date().toISOString().split('T')[0];

    let savedDate = localStorage.getItem("gold_date");
    let savedRate = localStorage.getItem("gold_rate");

    // Same day → use saved value
    if (savedDate === today && savedRate) {
      console.log("Using saved gold rate");
      document.getElementById("goldRate").innerText = savedRate;
      return;
    }

    // New day → API call
    console.log("Fetching new gold rate from API");

    const myHeaders = new Headers();
    myHeaders.append("x-access-token", "goldapi-ktrjsmlyxh1vs-io");
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = { method: 'GET', headers: myHeaders, redirect: 'follow' };

    const response = await fetch("https://www.goldapi.io/api/XAU/INR", requestOptions);
    const data = await response.json();

    let pricePerGram = data.price / 31.1035;
    let finalRate = pricePerGram.toFixed(0);

    // Save in localStorage
    localStorage.setItem("gold_date", today);
    localStorage.setItem("gold_rate", finalRate);

    document.getElementById("goldRate").innerText = finalRate;

  } catch (error) {
    console.error('Gold API fetch error:', error);

    // fallback
    let savedRate = localStorage.getItem("gold_rate") || 5000;
    document.getElementById("goldRate").innerText = savedRate;
  }
}

// Call on page load
window.onload = fetchGoldRate;
