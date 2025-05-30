import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  doc,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  deleteField,orderBy, limit
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import { setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDqCVJpeaGRhVLKawjmRP9k7AwXF-IyXSU",
  authDomain: "gharse-28e90.firebaseapp.com",
  databaseURL: "https://gharse-28e90-default-rtdb.firebaseio.com",
  projectId: "gharse-28e90",
  storageBucket: "gharse-28e90.appspot.com",
  messagingSenderId: "1079801080166",
  appId: "1:1079801080166:web:f887642a72831bcedd80a7",
  measurementId: "G-66X3VNRXED"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const statusEl = document.getElementById("status");
const orderBtn = document.getElementById("orderBtn");
const docRef = doc(db, "settings", "ShopStatus");

// Monitor shop status
onSnapshot(docRef, (docSnap) => {
  if (docSnap.exists()) {
    const data = docSnap.data();
    statusEl.textContent = data.isOpen ? "✅ Shop is OPEN" : "❌ Shop is CLOSED";
    orderBtn.disabled = !data.isOpen;
  }
});

function showToast(message) {
  console.log("showToast called with message:", message);  // Add this
  const toast = document.getElementById("toast");
  if (!toast) {
    console.error("Toast element not found in DOM.");
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 9000);
}


let modifyingOrderId = null;
orderBtn.addEventListener("click", () => {
  if (modifyingOrderId) {
    updateOrder(modifyingOrderId);
  } else {
    placeOrder();
  }
});


async function updateOrder(orderId) {
const items = [
  { id: "batataParatha", label: "Batata Paratha", price: 25 },
  { id: "methiParatha", label: "Methi Paratha", price: 25 },
  { id: "palakParatha", label: "Palak Paratha", price: 25 },
  { id: "paneerParatha", label: "Paneer Paratha", price: 35 },
  { id: "methiThalipeeth", label: "Methi Thalipeeth", price: 30 },
  { id: "gobiParatha", label: "Gobi Paratha", price: 30 },
  { id: "onionParatha", label: "Onion Paratha", price: 30 },
  { id: "batatamethiParatha", label: "Batata Methi Paratha", price: 30 },
  { id: "batatapalakParatha", label: "Batata Palak Paratha", price: 30 },
  { id: "paneerbutterParatha", label: "Paneer Butter Paratha", price: 40 },
  { id: "palakThalipeeth", label: "Palak Thalipeeth", price: 30 },
  { id: "paneerThalipeeth", label: "Paneer Thalipeeth", price: 35 },
  { id: "corianderThalipeeth", label: "Coriander Thalipeeth", price: 30 },
  { id: "onionThalipeeth", label: "Onion Thalipeeth", price: 30 },
  { id: "cucumberThalipeeth", label: "Cucumber Thalipeeth", price: 30 },
  { id: "beetrootThalipeeth", label: "Beetroot Thalipeeth", price: 30 },
  { id: "dhudhibhoplaThalipeeth", label: "Dhudhi Bhopla Thalipeeth", price: 30 },
  { id: "dalwada", label: "Dalwada", price: 20 },
  { id: "sabudanaKhichdi", label: "Sabudana Khichdi", price: 35 },
  { id: "dosa", label: "Dosa", price: 40 },
  { id: "idli", label: "Idli", price: 25 },
  { id: "upma", label: "Upma", price: 25 },
  { id: "pohe", label: "Pohe", price: 25 },
  { id: "sandwich", label: "Sandwich", price: 30 }
];


  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const pickupTime = document.getElementById("pickupTime").value;

  if (!name || !mobile || !pickupTime) {
    showToast("Please fill in all the required fields.");
    return;
  }

  if (!/^\d{10}$/.test(mobile)) {
    showToast("Mobile number must be exactly 10 digits.");
    return;
  }

let selectedItems = {};
let totalQuantity = 0;
let totalPrice = 0;
let summaryText = "";

items.forEach(item => {
  const quantity = parseInt(document.getElementById(item.id).value) || 0;
  if (quantity > 0) {
    const itemTotal = quantity * item.price;
    selectedItems[item.label] = quantity;
    totalQuantity += quantity;
    totalPrice += itemTotal;
    summaryText += `${item.label} (₹${item.price} x ${quantity}) = ₹${itemTotal}\n`;
  }
});

  // ✅ Show toast when entering update mode
  //showToast("You can update the order");

  // ✅ Prepare and show the modal summary
  const summaryPopup = 
  `Name: ${name}\nMobile: ${mobile}\nPickup Time: ${pickupTime}\n\nItems:\n${summaryText}\nTotal: ₹${totalPrice}`;


Swal.fire({
  title: "Updated Order Summary",
  text: summaryPopup,
  icon: "info",
  showCancelButton: true,
  confirmButtonText: "Confirm",
  cancelButtonText: "Cancel",
  customClass: {
    popup: 'swal2-toast-style'
  },
  width: 600
}).then(async (result) => {
  if (result.isConfirmed) {
    const orderRef = doc(db, "orders", orderId);

    // Clear old items
    const fieldsToDelete = {};
    items.forEach(item => {
      fieldsToDelete[item.label] = deleteField();
    });

    try {
      await updateDoc(orderRef, fieldsToDelete);

      const updatedOrder = {
        ...selectedItems,
        customerName: name,
        customerMobile: mobile,
        pickupTime,
        status: "modified",
        date: formatDate(new Date()),
      };

      await updateDoc(orderRef, updatedOrder);

      showToast("Order updated successfully!");
      document.getElementById("orderForm").reset();
      modifyingOrderId = null;
      document.getElementById("orderBtn").textContent = "Place Order";
    } catch (error) {
      console.error("Error updating order:", error);
      showToast("Failed to update the order. Please try again.");
    }
  } else {
    showToast("Order update cancelled.");
  }
});
}


//let modifyingOrderId = null;
function openModifyDialog(orderId, data) {
  // Set flag
  modifyingOrderId = orderId;

  // Fill form fields
  document.getElementById("name").value = data.customerName;
  document.getElementById("mobile").value = data.customerMobile;
  document.getElementById("pickupTime").value = data.pickupTime;

  // Fill item quantities
  Object.entries(data).forEach(([key, value]) => {
    const item = document.querySelector(`input[id]#${key}`);
    if (item && typeof value === "number") {
      item.value = value;
    }
  });
  
// Don't call updateOrder here — wait for user to submit

  // Change button text to 'Update Order'
  const orderBtn = document.getElementById("orderBtn");
  orderBtn.textContent = "Update Order";
  showToast("Kindly reselect menu items and press 'Update Order");
}

// Place Order
async function placeOrder() {
  const items = [
    { id: "batataParatha", label: "Batata Paratha", price: 25 },
  { id: "methiParatha", label: "Methi Paratha", price: 25 },
  { id: "palakParatha", label: "Palak Paratha", price: 25 },
  { id: "paneerParatha", label: "Paneer Paratha", price: 35 },
  { id: "methiThalipeeth", label: "Methi Thalipeeth", price: 30 },
  { id: "gobiParatha", label: "Gobi Paratha", price: 30 },
  { id: "onionParatha", label: "Onion Paratha", price: 30 },
  { id: "batatamethiParatha", label: "Batata Methi Paratha", price: 30 },
  { id: "batatapalakParatha", label: "Batata Palak Paratha", price: 30 },
  { id: "paneerbutterParatha", label: "Paneer Butter Paratha", price: 40 },
  { id: "palakThalipeeth", label: "Palak Thalipeeth", price: 30 },
  { id: "paneerThalipeeth", label: "Paneer Thalipeeth", price: 35 },
  { id: "corianderThalipeeth", label: "Coriander Thalipeeth", price: 30 },
  { id: "onionThalipeeth", label: "Onion Thalipeeth", price: 30 },
  { id: "cucumberThalipeeth", label: "Cucumber Thalipeeth", price: 30 },
  { id: "beetrootThalipeeth", label: "Beetroot Thalipeeth", price: 30 },
  { id: "dhudhibhoplaThalipeeth", label: "Dhudhi Bhopla Thalipeeth", price: 30 },
  { id: "dalwada", label: "Dalwada", price: 20 },
  { id: "sabudanaKhichdi", label: "Sabudana Khichdi", price: 35 },
  { id: "dosa", label: "Dosa", price: 40 },
  { id: "idli", label: "Idli", price: 25 },
  { id: "upma", label: "Upma", price: 25 },
  { id: "pohe", label: "Pohe", price: 25 },
  { id: "sandwich", label: "Sandwich", price: 30 }
  ];

  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const pickupTime = document.getElementById("pickupTime").value;

  if (!name || !mobile || !pickupTime) {
    showToast("Please fill in all the required fields.");
    return;
  }

  if (!/^\d{10}$/.test(mobile)) {
    showToast("Mobile number must be exactly 10 digits.");
    return;
  }

  let selectedItems = {};
  let totalQuantity = 0;
  let itemList = "";

  items.forEach(item => {
    const quantity = parseInt(document.getElementById(item.id).value) || 0;
    if (quantity > 0) {
      selectedItems[item.label] = quantity;
      totalQuantity += quantity;
      itemList += `${item.label}: ${quantity}<br>`;
    }
  });

  if (totalQuantity === 0) {
    showToast("Please select at least one item with quantity 1 or more.");
    return;
  }

  const summaryHtml = `
    <b>Name:</b> ${name}<br>
    <b>Mobile:</b> ${mobile}<br>
    <b>Pickup Time:</b> ${pickupTime}<br><br>
    <b>Items:</b><br>${itemList}
  `;

  const result = await Swal.fire({
    title: "Order Summary",
    html: summaryHtml,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel"
  });

  if (result.isConfirmed) {
    const orderSummary = {
      ...selectedItems,
      customerName: name,
      customerMobile: mobile,
      pickupTime,
      customerEmail: auth.currentUser.email,
      status: "placed",
      date: formatDate(new Date())
    };

    try {
      await addDoc(collection(db, "orders"), orderSummary);
      showToast("Order placed successfully!");
      document.getElementById("orderForm").reset();
      items.forEach(({ id }) => document.getElementById(id).value = "");
    } catch (error) {
      console.error("Firestore Error:", error.message);
      showToast("Failed to place the order. Please try again.");
    }
  }
}

// Register
import { fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";


// Logout
logoutBtn2.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      Swal.fire("Logged out", "You have been logged out.", "success");
    })
    .catch((error) => {
      Swal.fire("Error", error.message, "error");
    });
});



// Monitor Auth State
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("userInfo").style.display = "block";
    document.getElementById("userEmail").textContent = user.email;
    document.getElementById("orderForm").style.display = "block";

    document.getElementById("openLogin").style.display = "none";
    document.getElementById("openRegister").style.display = "none";
    document.getElementById("logoutBtn2").style.display = "inline-block";
    startListeningToSoldOutItems();

    listenToMyOrders();
    
  } else {
    document.getElementById("userInfo").style.display = "none";
    document.getElementById("userEmail").textContent = "";
    document.getElementById("orderForm").style.display = "none";

    document.getElementById("openLogin").style.display = "inline-block";
    document.getElementById("openRegister").style.display = "inline-block";
    document.getElementById("logoutBtn2").style.display = "none";
   
    showAuthModal("login"); // shows SweetAlert modal
  }
});

// Cancel Order
async function cancelOrder(orderId) {
  const result = await Swal.fire({
    title: "Cancel Order",
    text: "Are you sure you want to cancel this order?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, cancel it",
    cancelButtonText: "No, keep it"
  });

  if (!result.isConfirmed) return;

  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status: "cancelled" });

    await Swal.fire({
      title: "Cancelled",
      text: "Order cancelled successfully.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false
    });

    // listenToMyOrders(); // Optional: Refresh the order list if needed
  } catch (error) {
    console.error("Error cancelling order:", error);

    Swal.fire({
      title: "Error",
      text: "Failed to cancel the order. Please try again.",
      icon: "error"
    });
  }
}


// Fetch Orders
function listenToMyOrders() {
  const q = query(
    collection(db, "orders"),
    where("customerEmail", "==", auth.currentUser.email)
  );

  const liveOrdersContainer = document.getElementById("liveOrders");
  const orderHistoryContainer = document.getElementById("orderHistory");

  onSnapshot(q, (snapshot) => {
    liveOrdersContainer.innerHTML = "";
    orderHistoryContainer.innerHTML = "";

    snapshot.forEach((doc) => {
      const order = doc.data();
      const orderId = doc.id;
      const status = order.status || "placed";
      const isLive = status === "placed" || status === "meal_ready" || status === "modified";

      const card = document.createElement("div");
      card.className = "order-card";

      const itemsHTML = Object.entries(order)
        .filter(([key, val]) => typeof val === "number")
        .map(([item, qty]) => `<div>${item}: <strong>${qty}</strong></div>`)
        .join("");

      card.innerHTML = `
        <div class="order-header">
          <span>${order.customerName}</span>
          <span class="status-badge status-${status.replace(" ", "_")}">${status}</span>
        </div>
        <div><strong>Pickup:</strong> ${
  order.pickupTime
    ? new Date(order.pickupTime).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    : ""
}</div>

        <div class="order-items">${itemsHTML}</div>
        ${isLive ? `
          <button class="order-button modify-btn" data-id="${orderId}">Modify</button>
          <button class="order-button cancel-btn" data-id="${orderId}">Cancel</button>
        ` : ""}
      `;

      if (isLive) {
        card.querySelector(".modify-btn").addEventListener("click", () => {
          openModifyDialog(orderId, order);
        });

        card.querySelector(".cancel-btn").addEventListener("click", () => {
          cancelOrder(orderId);
        });

        liveOrdersContainer.appendChild(card);
      } else {
        orderHistoryContainer.appendChild(card);
      }
    });
  });
}




function startListeningToSoldOutItems() {
  const soldOutRef = doc(db, "Items_Status", "Sold_out");

  onSnapshot(soldOutRef, (docSnap) => {
    if (docSnap.exists()) {
      const statusData = docSnap.data();

      Object.entries(statusData).forEach(([itemId, isAvailable]) => {
        const input = document.getElementById(itemId);
        const label = document.querySelector(`label[for="${itemId}"]`);

        if (input) {
          input.disabled = !isAvailable;

          if (!isAvailable) {
            if (label && !label.textContent.includes("Sold Out")) {
              label.textContent += " (Sold Out)";
              label.style.color = "red";
            }
            input.value = "";
          } else {
            if (label) {
              label.textContent = label.textContent.replace(" (Sold Out)", "");
              label.style.color = "";
            }
          }
        }
      });
    }
  });
}


function showAuthModal(mode = "login") {
  Swal.fire({
    title: mode === "login" ? "Login to Your Account" : "Create an Account",
    html: `
      <input type="email" id="swalEmail" class="swal2-input" placeholder="Email">
      <input type="password" id="swalPassword" class="swal2-input" placeholder="Password">
    `,
    confirmButtonText: mode === "login" ? "Login" : "Register",
    showCancelButton: true,
    preConfirm: async () => {
      const email = document.getElementById('swalEmail').value.trim();
      const password = document.getElementById('swalPassword').value.trim();

      if (!email || !password) {
        Swal.showValidationMessage("Please enter both Email and Password");
        return false;
      }

      try {
        if (mode === "login") {
          await setPersistence(auth, browserSessionPersistence);
          await signInWithEmailAndPassword(auth, email, password);
          Swal.fire("Success!", "You are now logged in.", "success");
        } else {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods.length > 0) {
            throw new Error("This email is already registered. Try logging in.");
          }
          await createUserWithEmailAndPassword(auth, email, password);
          Swal.fire("Success!", "Account created successfully.", "success");
        }
      } catch (error) {
        Swal.showValidationMessage(error.message);
        return false;
      }
    }
  });
}
document.getElementById("openLogin").addEventListener("click", () => showAuthModal("login"));
document.getElementById("openRegister").addEventListener("click", () => showAuthModal("register"));


function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".category-nav button:nth-child(1)").addEventListener("click", () => scrollToSection("parathas-section"));
  document.querySelector(".category-nav button:nth-child(2)").addEventListener("click", () => scrollToSection("thalipeeth-section"));
  document.querySelector(".category-nav button:nth-child(3)").addEventListener("click", () => scrollToSection("snacks-section"));
});


function formatDate(dateObj) {
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = dateObj.getFullYear();

  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}