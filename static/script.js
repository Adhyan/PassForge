/* ─── PassForge — Frontend Script ─────────────────────────────────── */

const API_BASE = "";

// ── DOM refs ──────────────────────────────────────────────────────────
const lengthSlider   = document.getElementById("length");
const lengthDisplay  = document.getElementById("length-display");
const countSlider    = document.getElementById("count");
const countDisplay   = document.getElementById("count-display");
const generateBtn    = document.getElementById("generateBtn");
const resultSection  = document.getElementById("results");
const passwordList   = document.getElementById("password-list");
const analyzeInput   = document.getElementById("analyze-input");
const analyzeBtn     = document.getElementById("analyzeBtn");
const analysisResult = document.getElementById("analysis-result");
const toast          = document.getElementById("toast");

// ── Range sliders ─────────────────────────────────────────────────────
lengthSlider.addEventListener("input", () => {
  lengthDisplay.textContent = lengthSlider.value;
});

countSlider.addEventListener("input", () => {
  countDisplay.textContent = countSlider.value;
  generateBtn.querySelector("span:last-child").textContent =
    countSlider.value > 1
      ? `Generate ${countSlider.value} Passwords`
      : "Generate Password";
});

// ── Generate ──────────────────────────────────────────────────────────
generateBtn.addEventListener("click", async () => {
  const payload = {
    length:            parseInt(lengthSlider.value),
    uppercase:         document.getElementById("uppercase").checked,
    lowercase:         document.getElementById("lowercase").checked,
    digits:            document.getElementById("digits").checked,
    symbols:           document.getElementById("symbols").checked,
    exclude_ambiguous: document.getElementById("exclude_ambiguous").checked,
    count:             parseInt(countSlider.value),
  };

  generateBtn.classList.add("loading");
  generateBtn.querySelector("span:last-child").textContent = "Generating…";

  try {
    const res  = await fetch(`${API_BASE}/api/generate`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    renderPasswords(data.passwords);
    resultSection.style.display = "block";
    resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });

  } catch (err) {
    alert("Could not connect to the server. Make sure Flask is running.");
  } finally {
    generateBtn.classList.remove("loading");
    generateBtn.querySelector("span:last-child").textContent =
      countSlider.value > 1
        ? `Generate ${countSlider.value} Passwords`
        : "Generate Password";
  }
});

// ── Render password cards ─────────────────────────────────────────────
function renderPasswords(passwords) {
  passwordList.innerHTML = "";

  passwords.forEach((item, idx) => {
    const { password, entropy, strength } = item;
    const barWidth = Math.min(100, (strength.score / 5) * 100);

    const div = document.createElement("div");
    div.className = "password-item";
    div.innerHTML = `
      <div class="pw-row">
        <span class="pw-text">${escapeHTML(password)}</span>
        <button class="btn-copy" data-pw="${escapeAttr(password)}">Copy</button>
      </div>
      <div class="pw-meta">
        <div class="strength-bar-wrap">
          <div class="strength-bar" style="width:0%; background:${strength.color}"></div>
        </div>
        <span class="strength-label" style="color:${strength.color}">${strength.label}</span>
        <span class="entropy-text">${entropy} bits</span>
      </div>
    `;

    passwordList.appendChild(div);

    // Animate bar after paint
    requestAnimationFrame(() => {
      setTimeout(() => {
        div.querySelector(".strength-bar").style.width = barWidth + "%";
      }, 50 + idx * 80);
    });
  });

  // Copy buttons
  passwordList.querySelectorAll(".btn-copy").forEach(btn => {
    btn.addEventListener("click", () => {
      copyToClipboard(btn.dataset.pw);
      btn.textContent = "Copied!";
      setTimeout(() => (btn.textContent = "Copy"), 1500);
    });
  });
}

// ── Analyze ───────────────────────────────────────────────────────────
analyzeBtn.addEventListener("click", analyzePassword);
analyzeInput.addEventListener("keydown", e => {
  if (e.key === "Enter") analyzePassword();
});

async function analyzePassword() {
  const pw = analyzeInput.value.trim();
  if (!pw) return;

  try {
    const res  = await fetch(`${API_BASE}/api/analyze`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ password: pw }),
    });
    const data = await res.json();

    if (data.error) { alert(data.error); return; }
    renderAnalysis(data);

  } catch {
    alert("Could not connect to the server.");
  }
}

function renderAnalysis(d) {
  const barWidth = Math.min(100, (d.strength.score / 5) * 100);

  analysisResult.innerHTML = `
    <div class="analysis-strength">
      <span class="label" style="color:${d.strength.color}">${d.strength.label}</span>
      <span class="entropy">${d.entropy} bits of entropy</span>
    </div>
    <div class="strength-bar-wrap" style="margin-bottom:14px">
      <div class="strength-bar" id="analyze-bar" style="width:0%; background:${d.strength.color}; height:6px; border-radius:3px;"></div>
    </div>
    <div class="analysis-grid">
      <div class="analysis-item">
        <div class="val">${d.length}</div>
        <div class="lbl">Length</div>
      </div>
      <div class="analysis-item">
        <div class="val check ${d.has_uppercase ? 'yes' : 'no'}">${d.has_uppercase ? '✓' : '✗'}</div>
        <div class="lbl">Uppercase</div>
      </div>
      <div class="analysis-item">
        <div class="val check ${d.has_lowercase ? 'yes' : 'no'}">${d.has_lowercase ? '✓' : '✗'}</div>
        <div class="lbl">Lowercase</div>
      </div>
      <div class="analysis-item">
        <div class="val check ${d.has_digits ? 'yes' : 'no'}">${d.has_digits ? '✓' : '✗'}</div>
        <div class="lbl">Numbers</div>
      </div>
      <div class="analysis-item">
        <div class="val check ${d.has_symbols ? 'yes' : 'no'}">${d.has_symbols ? '✓' : '✗'}</div>
        <div class="lbl">Symbols</div>
      </div>
      <div class="analysis-item">
        <div class="val">${d.strength.score}/5</div>
        <div class="lbl">Score</div>
      </div>
    </div>
  `;

  analysisResult.style.display = "block";

  requestAnimationFrame(() => {
    setTimeout(() => {
      const bar = document.getElementById("analyze-bar");
      if (bar) bar.style.transition = "width 0.6s cubic-bezier(0.4,0,0.2,1)";
      if (bar) bar.style.width = barWidth + "%";
    }, 30);
  });
}

// ── Clipboard ─────────────────────────────────────────────────────────
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(showToast);
  } else {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity  = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast();
  }
}

function showToast() {
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

// ── Helpers ───────────────────────────────────────────────────────────
function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(str) {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
