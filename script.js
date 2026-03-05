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

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    const response = await fetch("https://www.goldapi.io/api/XAU/INR", requestOptions);
    const data = await response.json();

    let pricePerGram = data.price / 31.1035;
    let finalRate = pricePerGram.toFixed(0);

    // Save in localStorage
    localStorage.setItem("gold_date", today);
    localStorage.setItem("gold_rate", finalRate);

    document.getElementById("goldRate").innerText = finalRate;

  } catch (error) {
    console.error("Gold API fetch error:", error);

    // fallback
    let savedRate = localStorage.getItem("gold_rate") || 5000;
    document.getElementById("goldRate").innerText = savedRate;
  }
}

// Page load
window.onload = fetchGoldRate;






// 🔹 Supabase Config
const supabaseUrl = "https://vkycwtyoxnuipovmrefw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWN3dHlveG51aXBvdm1yZWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MDc0NTksImV4cCI6MjA4ODE4MzQ1OX0.fxwxRSM-HSFHZ-L_iFo_AksSDAMk6tU9gSwq_iuxYE4";

// 🔹 Create Client
const { createClient } = supabase;
const client = createClient(supabaseUrl, supabaseKey);

// 🔹 Bucket Name
const bucket = "banners";

let fileInput;
let bannerList;

window.onload = function () {
  fileInput = document.getElementById("fileInput");
  bannerList = document.getElementById("bannerList");
  loadBanners();
};

// 🔹 Load Images
async function loadBanners() {
  bannerList.innerHTML = "Loading...";

  const { data, error } = await client.storage
    .from(bucket)
    .list("", { limit: 100 });

  if (error) {
    bannerList.innerHTML = "Error loading";
    console.error(error);
    return;
  }

  bannerList.innerHTML = "";

  if (!data || data.length === 0) {
    bannerList.innerHTML = "No banners uploaded.";
    return;
  }

  data.forEach(file => {
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${file.name}`;

    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${imageUrl}" width="300"><br>
      <button onclick="deleteBanner('${file.name}')">Delete</button>
      <hr>
    `;
    bannerList.appendChild(div);
  });
}

// 🔹 Upload
async function uploadBanners() {
  const files = fileInput.files;

  if (!files.length) {
    alert("Select file first");
    return;
  }

  for (let file of files) {
    const fileName = Date.now() + "_" + file.name;

    const { error } = await client.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      alert("Upload failed");
      console.error(error);
      return;
    }
  }

  alert("Upload Success");
  fileInput.value = "";
  loadBanners();
}

// 🔹 Delete
async function deleteBanner(fileName) {
  const { error } = await client.storage
    .from(bucket)
    .remove([fileName]);

  if (error) {
    alert("Delete failed");
    console.error(error);
    return;
  }

  alert("Deleted");
  loadBanners();
}
