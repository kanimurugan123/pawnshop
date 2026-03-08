async function fetchGoldRate() {

  const goldElement = document.getElementById("goldRate");
  if (!goldElement) return;

  try {

    const today = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem("gold_date");
    const savedRate = localStorage.getItem("gold_rate");

    // Use cached rate if same day
    if (savedDate === today && savedRate) {
      console.log("Using cached gold rate");
      goldElement.innerText = savedRate;
      return;
    }

    console.log("Fetching gold rate from API");

    const response = await fetch("https://www.goldapi.io/api/XAU/INR", {
      headers: {
        "x-access-token": "goldapi-ktrjsmlyxh1vs-io",
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    const pricePerGram = data.price / 31.1035;
    const finalRate = pricePerGram.toFixed(0);

    localStorage.setItem("gold_date", today);
    localStorage.setItem("gold_rate", finalRate);

    goldElement.innerText = finalRate;

  } catch (error) {

    console.error("Gold API error:", error);

    const savedRate = localStorage.getItem("gold_rate") || 5000;
    goldElement.innerText = savedRate;

  }
}

// 🔹 Supabase Config
const supabaseUrl = "https://cepjynxdrtgwxuvgxshy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlcGp5bnhkcnRnd3h1dmd4c2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDU1NjgsImV4cCI6MjA4ODI4MTU2OH0.iheA__HV_-UA9ryHecSyFEfbotIfq8gp95mJECsytIQ"
// 🔹 Create Client
const { createClient } = supabase;
const client = createClient(supabaseUrl, supabaseKey);

// 🔹 Bucket Name
const bucket = "banners";

let fileInput;   
let bannerList;

// 🔹 Load Images
async function loadCarouselBanners() {

  const container = document.getElementById("bannerCarousel");
  if (!container) return;

  const { data, error } = await client.storage
    .from(bucket)
    .list("", { limit: 100 });

  if (error) {
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No banners found</p>";
    return;
  }

  // newest first
  data.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));

  container.innerHTML = "";

  data.forEach((file, index) => {

    const imageUrl =
      `${supabaseUrl}/storage/v1/object/public/${bucket}/${file.name}`;

    const div = document.createElement("div");

    div.className = "carousel-item " + (index === 0 ? "active" : "");

    div.innerHTML =
      `<img src="${imageUrl}" class="d-block w-100">`;

    container.appendChild(div);

  });

}
window.addEventListener("load", function () {



 fetchGoldRate();

  if(document.getElementById("bannerCarousel")){
    loadCarouselBanners();
  }

  if(document.getElementById("bannerList")){
    loadAdminBanners();
  }

  fileInput = document.getElementById("fileInput");
  bannerList = document.getElementById("bannerList");
  fileInput = document.getElementById("fileInput");
  bannerList = document.getElementById("bannerList");

});


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
  loadAdminBanners();
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
loadAdminBanners();
}

async function loadAdminBanners() {
  const { data, error } = await client.storage.from(bucket).list("", { limit: 100 });
  if (error) return console.error(error);

  bannerList.innerHTML = "";

  data.forEach(file => {
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${file.name}`;
    const div = document.createElement("div");
    div.className = "col-md-3";

    div.innerHTML = `
      <div class="banner-box">
        <img src="${imageUrl}">
        <button class="btn btn-danger w-100 mt-2" onclick="deleteBanner('${file.name}')">Delete</button>
      </div>
    `;

    bannerList.appendChild(div);
  });
}