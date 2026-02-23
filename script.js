
function calcLoan() {
  let gram = +document.getElementById("gram").value;
  let rate = +document.getElementById("rate").value;
  let interest = +document.getElementById("interest").value;
  let type = document.getElementById("type").value; // typo fixed

  if (gram <= 0 || rate <= 0 || interest <= 0 || type === "") {
    document.getElementById("result").innerHTML = 
      "<span class='text-danger'>அனைத்து விவரங்களையும் சரியாக உள்ளிடவும்</span>";
    return;
  }

  // Loan amount
  let loanAmount = gram * rate;

  // Auto period: 12 months or 52 weeks
  let period = (type === "monthly") ? 12 : 52;

  // Total interest = interest per period * number of periods
  let totalInterest = interest * period;

  // Total amount
  let totalAmount = loanAmount + totalInterest;

  // Per month/week payment
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
    const myHeaders = new Headers();
    myHeaders.append("x-access-token", "goldapi-ktrjsmlyxh1vs-io"); // GoldAPI Key
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = { method: 'GET', headers: myHeaders, redirect: 'follow' };

    const response = await fetch("https://www.goldapi.io/api/XAU/INR", requestOptions);
    const data = await response.json();

    // GoldAPI returns price per ounce, but we need per gram
    // 1 ounce = 31.1035 grams
    let pricePerGram = data.price / 31.1035;

    // Show rounded price
    document.getElementById("goldRate").innerText = pricePerGram.toFixed(0);

  } catch (error) {
    console.error('Gold API fetch error:', error);
    // Fallback value in case API fails
    document.getElementById("goldRate").innerText = 5000;
  }
}

// Call the function on page load
window.onload = fetchGoldRate;




// var myHeaders = new Headers();
// myHeaders.append("x-access-token", "goldapi-19o1g6smlyro24y-io");
// myHeaders.append("Content-Type", "application/json");

// var requestOptions = {
//   method: 'GET',
//   headers: myHeaders,
//   redirect: 'follow'
// };

// fetch("https://www.goldapi.io/api/XAU/INR", requestOptions)
//   .then(response => response.text())
//   .then(result => console.log(result))
//   .catch(error => console.log('error', error));

