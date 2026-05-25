import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";

// ─── REPLACE WITH YOUR FIREBASE CONFIG ───────────────────────────────────────
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
// ─────────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ── Small reusable UI components (no external shadcn needed) ──────────────────
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow border border-gray-100 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, type = "button", variant = "primary", className = "" }) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all text-sm";
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-600 text-white hover:bg-green-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ placeholder, value, onChange, type = "text", required, accept }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    accept={accept}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

const Textarea = ({ placeholder, value, onChange, required }) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    rows={3}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
  />
);
// ─────────────────────────────────────────────────────────────────────────────

export default function BethelPlatform() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auth form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Application form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [amount, setAmount] = useState("");
  const [idea, setIdea] = useState("");
  const [docFile, setDocFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Auth state listener ──────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const q = query(collection(db, "users"), where("uid", "==", u.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setRole(snap.docs[0].data().role ?? "user");
        }
      } else {
        setUser(null);
        setRole("user");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Real-time applications listener ─────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const q =
      role === "admin"
        ? collection(db, "applications")
        : query(collection(db, "applications"), where("userId", "==", user.uid));

    const unsub = onSnapshot(q, (snapshot) => {
      setApplications(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user, role]);

  // ── Auth handlers ────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setAuthError("");
    if (!email || !password) return setAuthError("Please enter email and password.");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleSignup = async () => {
    setAuthError("");
    if (!email || !password) return setAuthError("Please enter email and password.");
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await addDoc(collection(db, "users"), { uid: res.user.uid, role: "user" });
    } catch (err) {
      setAuthError(err.message);
    }
  };

  // ── Application submission ───────────────────────────────────────────────
  const submitApplication = async () => {
    if (!name || !phone || !business || !amount || !idea) {
      return alert("Please fill in all required fields.");
    }
    setSubmitting(true);

    // Convert file to base64 if provided (avoids needing Firebase Storage)
    let fileData = "";
    let fileName = "";
    if (docFile) {
      fileName = docFile.name;
      fileData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(docFile);
      });
    }

    await addDoc(collection(db, "applications"), {
      name,
      phone,
      business,
      amount: Number(amount),
      idea,
      fileData,      // base64 string (omit if you'd prefer Firebase Storage)
      fileName,
      userId: user.uid,
      status: "Pending",
      repaid: 0,
      total: Number(amount),
      progress: 0,
      createdAt: new Date(),
    });

    // Reset form
    setName(""); setPhone(""); setBusiness(""); setAmount(""); setIdea(""); setDocFile(null);
    setSubmitting(false);
    alert("Application submitted!");
  };

  // ── Repayment ────────────────────────────────────────────────────────────
  const updateRepayment = async (app) => {
    const newRepaid = Math.min(app.repaid + 100, app.total);
    const progress = (newRepaid / app.total) * 100;
    await updateDoc(doc(db, "applications", app.id), { repaid: newRepaid, progress });
  };

  // ── Admin status update ──────────────────────────────────────────────────
  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "applications", id), { status });
  };

  // ── Analytics ────────────────────────────────────────────────────────────
  const totalLoans = applications.reduce((s, a) => s + (a.total || 0), 0);
  const totalRepaid = applications.reduce((s, a) => s + (a.repaid || 0), 0);
  const approvalRate = applications.length
    ? (applications.filter((a) => a.status === "Approved").length / applications.length) * 100
    : 0;

  const statusColor = {
    Pending: "text-yellow-600 bg-yellow-50",
    Approved: "text-green-700 bg-green-50",
    Rejected: "text-red-600 bg-red-50",
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading…</div>;
  }

  // ── Login / Signup screen ────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent>
            <h1 className="text-2xl font-bold text-center text-blue-700 mb-1">BETHEL SME FUNDINGS</h1>
            <p className="text-center text-gray-500 text-sm mb-6">Empowering small businesses</p>

            <div className="space-y-3">
              <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {authError && <p className="text-red-500 text-sm">{authError}</p>}
              <div className="flex gap-2 pt-1">
                <Button onClick={handleLogin} className="flex-1">Login</Button>
                <Button onClick={handleSignup} variant="outline" className="flex-1">Sign Up</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main dashboard ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">BETHEL SME FUNDINGS</h2>
            <p className="text-sm text-gray-500 capitalize">{role} Dashboard — {user.email}</p>
          </div>
          <Button variant="outline" onClick={() => auth.signOut()}>Sign Out</Button>
        </div>

        {/* Admin Analytics */}
        {role === "admin" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Loans</p>
                <p className="text-2xl font-bold text-blue-700">P{totalLoans.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Repaid</p>
                <p className="text-2xl font-bold text-green-600">P{totalRepaid.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Approval Rate</p>
                <p className="text-2xl font-bold text-purple-600">{approvalRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Application Form (user only) */}
        {role === "user" && (
          <Card>
            <CardContent>
              <h3 className="font-semibold text-gray-700 mb-4">Apply for Funding</h3>
              <div className="space-y-3 max-w-md">
                <Input placeholder="Full Name *" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Input placeholder="Business Name *" value={business} onChange={(e) => setBusiness(e.target.value)} />
                <Input placeholder="Loan Amount (P) *" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <Textarea placeholder="Describe your business idea *" value={idea} onChange={(e) => setIdea(e.target.value)} />
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Supporting Document (optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setDocFile(e.target.files[0])}
                    className="text-sm text-gray-600"
                  />
                </div>
                <Button onClick={submitApplication} className="w-full" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Application"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Applications list */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">
            {role === "admin" ? "All Applications" : "My Applications"} ({applications.length})
          </h3>

          {applications.length === 0 && (
            <p className="text-gray-400 text-sm">No applications yet.</p>
          )}

          <div className="grid gap-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardContent>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{app.business}</p>
                      {role === "admin" && <p className="text-sm text-gray-500">{app.name} · {app.phone}</p>}
                      <p className="text-sm text-gray-500 mt-1">{app.idea}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[app.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="flex gap-6 text-sm text-gray-600 mt-3 mb-3">
                    <span>Loan: <strong>P{(app.total || 0).toLocaleString()}</strong></span>
                    <span>Repaid: <strong>P{(app.repaid || 0).toLocaleString()}</strong></span>
                    <span>Progress: <strong>{Math.min(Math.round(app.progress || 0), 100)}%</strong></span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 h-2 rounded-full mb-3">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(app.progress || 0, 100)}%` }}
                    />
                  </div>

                  {/* Document link */}
                  {app.fileData && (
                    <a
                      href={app.fileData}
                      download={app.fileName || "document"}
                      className="text-blue-500 text-sm underline block mb-3"
                    >
                      📎 {app.fileName || "View Document"}
                    </a>
                  )}

                  {/* Admin actions */}
                  {role === "admin" && (
                    <div className="flex gap-2">
                      <Button variant="success" onClick={() => updateStatus(app.id, "Approved")}>Approve</Button>
                      <Button variant="danger" onClick={() => updateStatus(app.id, "Rejected")}>Reject</Button>
                    </div>
                  )}

                  {/* User repayment */}
                  {role === "user" && app.status === "Approved" && app.repaid < app.total && (
                    <Button onClick={() => updateRepayment(app)}>Pay P100</Button>
                  )}
                  {role === "user" && app.repaid >= app.total && (
                    <p className="text-green-600 text-sm font-medium">✅ Fully Repaid</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
