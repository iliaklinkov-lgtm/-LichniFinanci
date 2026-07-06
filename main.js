
function checkAuthentication() {
  const loggedInUser = localStorage.getItem('currentUser');
  if (!loggedInUser) {
    window.location.href = './login-page.html';
    return false;
  }
  return true;
}

function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Сигурен ли си, че искаш да излезеш?')) {
        localStorage.removeItem('currentUser');
        window.location.href = './login-page.html';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (checkAuthentication()) {
    setupLogout();
  }
});


const transactions= [
    {
        id: 1,
        description: "Salary",
        amount: 5000,
        type: "income",         
    },
    {
        id: 2,
        description: "Groceries",
        amount: -150,
        type: "expense",
    }
]




class BudgetTraker{
    constructor(){
        this.transactions = this.loadTransactions();
        this.categories = this.loadCategories();
        this.form = document.getElementById("transactionForm");
        this.transactionslist = document.getElementById("transactionlist");
        this.balanceElement = document.getElementById("balance");
        this.categoryInput = document.getElementById("categoryInput");
        this.addCategoryButton = document.getElementById("addCategoryBtn");
        this.categoryTable = document.getElementById("categoryTable");
        this.categorySelect = document.getElementById("categorySelect") || document.querySelector("select[name='category']");
        this.categorySection = document.getElementById("categorySection");
        this.toggleCategoryBtn = document.getElementById("toggleCategoryBtn");
        this.initEventListeners();
        this.initCategoryEventListeners();
        this.renderTransactions();
        this.renderCategories();
        this.updateBalance();
        this.chart = null;
        this.renderChart();
    }

    loadTransactions() {
        return JSON.parse(localStorage.getItem("transactions")) || [];
    }
    saveTransactions() {
        localStorage.setItem("transactions", JSON.stringify(this.transactions));
    }

    loadCategories() {
        return JSON.parse(localStorage.getItem("categories")) || [];
    }
    saveCategories() {
        localStorage.setItem("categories", JSON.stringify(this.categories));
    }

    initEventListeners() {
        if (this.form) {
            this.form.addEventListener("submit", (e) => {
                e.preventDefault();
                this.addTransaction();
            });
        }
        
        if (this.categorySelect) {
            this.categorySelect.addEventListener("change", (e) => {
                if (e.target.value) {
                    const descriptionInput = document.getElementById("description");
                    if (descriptionInput) {
                        descriptionInput.focus();
                    }
                }
            });
        }
    }

    initCategoryEventListeners() {
        if (this.addCategoryButton && this.categoryInput) {
            this.addCategoryButton.addEventListener("click", (e) => {
                e.preventDefault();
                this.addCategory();
            });
        }
        
        if (this.toggleCategoryBtn) {
            this.toggleCategoryBtn.addEventListener("click", () => {
                this.toggleCategorySection();
            });
        }
    }

    addCategory() {
        const category = this.categoryInput.value.trim();
        if (!category) return;
        if (this.categories.includes(category)) {
            alert("Категорията вече съществува.");
            return;
        }
        this.categories.push(category);
        this.saveCategories();
        this.renderCategories();
        this.renderCategoryOptions();
        this.showCategorySection();
        if (this.categorySelect) {
            this.categorySelect.value = category;
        }
        this.categoryInput.value = "";
        
        const descriptionInput = document.getElementById("description");
        if (descriptionInput) {
            descriptionInput.focus();
            descriptionInput.value = "";
        }
    }

    showCategorySection() {
        if (this.categorySection) {
            this.categorySection.classList.add("active");
        }
    }

    toggleCategorySection() {
        if (this.categorySection) {
            this.categorySection.classList.toggle("active");
        }
    }

    renderCategories() {
        if (this.categoryTable) {
            const tbody = this.categoryTable.querySelector("tbody");
            if (!tbody) return;
            
            tbody.innerHTML = "";
            if (this.categories.length === 0) {
                const row = document.createElement("tr");
                row.innerHTML = '<td colspan="3" style="text-align: center; padding: 1rem; color: #999;">Няма добавени категории.</td>';
                tbody.appendChild(row);
            } else {
                this.categories.forEach((category, index) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td style="padding: 0.75rem;">${index + 1}</td>
                        <td style="padding: 0.75rem;">${category}</td>
                        <td style="padding: 0.75rem;">
                            <button class="category-delete-btn" data-category="${category}">Изтрий</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
            this.attachCategoryDeleteListeners();
        }

        this.renderCategoryOptions();
    }

    attachCategoryDeleteListeners() {
        const tbody = this.categoryTable.querySelector("tbody");
        if (!tbody) return;
        
        tbody.querySelectorAll(".category-delete-btn").forEach((button) => {
            button.addEventListener("click", () => {
                const category = button.dataset.category;
                if (confirm(`Сигурен ли сте, че искате да изтриете "${category}"?`)) {
                    this.deleteCategory(category);
                }
            });
        });
    }

    deleteCategory(categoryToDelete) {
        this.categories = this.categories.filter((cat) => cat !== categoryToDelete);
        this.saveCategories();
        this.renderCategories();
        
        if (this.categorySelect && this.categorySelect.value === categoryToDelete) {
            this.categorySelect.value = "";
        }
    }

    renderCategoryOptions() {
        if (!this.categorySelect) return;
        this.categorySelect.innerHTML = "<option value=\"\">Избери категория</option>";
        this.categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            this.categorySelect.appendChild(option);
        });
    }

    clearForm() {
        document.getElementById("description").value = "";
        document.getElementById("Amount").value = "";
    }

    addTransaction() {
        const description = document.getElementById("description").value.trim();
        const amount = parseFloat(document.getElementById("Amount").value);
        const type = document.getElementById("type").value;
        const category = this.categorySelect ? this.categorySelect.value : "";

        if (description === "" || isNaN(amount)) {
            alert("Моля, въведете валидно описание и сума.");
            return;
        }
        const transaction = {
            id: Date.now(),
            description,
            amount: type === "income" ? amount : -amount,
            type,
            category: category || "Без категория",
            date: new Date().toISOString()
        };
        this.transactions.push(transaction);
        this.saveTransactions();
        this.renderTransactions();
        this.updateBalance();
        this.renderChart();
        this.form.reset();
        updateProgress();
    }

    renderTransactions() {
        this.transactionslist.innerHTML = "";
        this.transactions.slice().sort((a,b)=> b.id - a.id)
            .forEach((transaction) => {
                const transactionDiv = document.createElement("div");
                transactionDiv.classList.add("transaction", transaction.type);
                transactionDiv.innerHTML = `
                <span>${transaction.description}</span>
                <span class="transaction-category">${transaction.category || "Без категория"}</span>
                    <span class="transaction-amount-container">
                € ${Math.abs(transaction.amount).toFixed(2)}
                <button class="DeleteBtn" data-id="${
                    transaction.id
                }">Изтрий</button> </span
                   >
                `;
                this.transactionslist.appendChild(transactionDiv);

            });
            this.attachDeleteEventListeners();
    }
    attachDeleteEventListeners() {
        this.transactionslist.querySelectorAll(".DeleteBtn").forEach((button) => {
            button.addEventListener("click", () => {
                this.deleteTransaction(Number(button.dataset.id))
            });
        });
    }   
        
    deleteTransaction(id) {
        this.transactions = this.transactions.filter((transaction) => transaction.id !== id);
        this.renderTransactions();
        this.updateBalance();
        this.saveTransactions();
        this.renderChart();
    }

    updateBalance() {
        const total = this.transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        this.balanceElement.textContent = `€ ${total.toFixed(2)}`;
    }
    getMonthlyData() {
  const map = {};
  this.transactions.forEach((t) => {
    const d = t.date ? new Date(t.date) : new Date(t.id);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map[key]) map[key] = { income: 0, expense: 0 };
    if (t.type === 'income') map[key].income += t.amount;
    else map[key].expense += Math.abs(t.amount);
  });
  const sorted = Object.keys(map).sort();
  const bg = {'01':'Яну','02':'Фев','03':'Мар','04':'Апр','05':'Май','06':'Юни',
               '07':'Юли','08':'Авг','09':'Сеп','10':'Окт','11':'Ное','12':'Дек'};
  return {
    labels: sorted.map(k => `${bg[k.split('-')[1]]} ${k.split('-')[0]}`),
    income: sorted.map(k => map[k].income),
    expense: sorted.map(k => map[k].expense)
  };
}

renderChart() {
  const canvas = document.getElementById('monthlyChart');
  if (!canvas) return;
  const { labels, income, expense } = this.getMonthlyData();
  const emptyState = document.getElementById('chartEmptyState');
  if (labels.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
    canvas.style.display = 'none';
    return;
  }
  if (emptyState) emptyState.style.display = 'none';
  canvas.style.display = 'block';
  if (this.chart) {
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = income;
    this.chart.data.datasets[1].data = expense;
    this.chart.update('active');
    return;
  }
  this.chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Приходи',
          data: income,
          backgroundColor: 'rgba(30, 108, 53, 0.75)',
          borderColor: 'rgba(30, 108, 53, 1)',
          borderWidth: 2, borderRadius: 8, borderSkipped: false,
        },
        {
          label: 'Разходи',
          data: expense,
          backgroundColor: 'rgba(192, 0, 0, 0.65)',
          borderColor: 'rgba(192, 0, 0, 1)',
          borderWidth: 2, borderRadius: 8, borderSkipped: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 700, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          labels: { font: { family: 'Inter, sans-serif', size: 13 }, color: '#1e6c35', padding: 16 }
        },
        tooltip: {
          backgroundColor: 'rgba(255,255,255,0.95)',
          titleColor: '#1e6c35', bodyColor: '#333',
          borderColor: 'rgba(30,108,53,0.3)', borderWidth: 1,
          padding: 12, cornerRadius: 10,
          callbacks: { label: ctx => ` € ${ctx.parsed.y.toFixed(2)}` }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#555' } },
        y: {
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: { color: '#555', callback: v => `€ ${v}` },
          beginAtZero: true
        }
      }
    }
  });
}
}





let budgettraker = null;

const initializeBudgetTracker = () => {
    budgettraker = new BudgetTraker();
    updateProgress();
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeBudgetTracker);
} else {
    initializeBudgetTracker();
}

let budget = 0;

function setBudget() {
  const val = parseFloat(document.getElementById('budgetInput').value);
  if (!val || val <= 0) return;
  budget = val;
  document.getElementById('progressContainer').style.display = 'block';
  updateProgress();
}

function updateProgress() {
  if (budget <= 0) return;

  const spent = (budgettraker?.transactions || [])
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const pct = Math.min((spent / budget) * 100, 100);
  const fill = document.getElementById('progressFill');
  const label = document.getElementById('budgetLabel');

  fill.style.width = pct + '%';
  label.textContent = `Изразходвано: €${spent.toFixed(2)} от €${budget.toFixed(2)}`;

  if (pct >= 100)     fill.style.background = '#a12c7b';
  else if (pct >= 80) fill.style.background = '#e05c00';
  else if (pct >= 60) fill.style.background = '#d19900';
  else                fill.style.background = '#437a22';
}
