import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export default function App() {
  const [activeTab, setActiveTab] = useState("catalog");
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("1");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    isbn: "",
    genre: "",
    total_copies: 1,
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "member",
  });

  const fetchData = async () => {
    try {
      const booksRes = await axios.get(`${API_URL}/books`);
      setBooks(booksRes.data);
      
      const loansRes = await axios.get(`${API_URL}/loans`);
      setLoans(loansRes.data);

      const usersRes = await axios.get(`${API_URL}/users`);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Error communicating with backend:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBook = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_URL}/books`, bookForm);
      setBookForm({ title: "", author: "", isbn: "", genre: "", total_copies: 1 });
      fetchData();
      setSuccess("Book added to catalog successfully!");
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred adding the book.");
    }
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(`${API_URL}/users`, userForm);
      setUserForm({ name: "", email: "", role: "member" });
      fetchData();
      setSuccess(`User "${res.data.name}" registered successfully with ID: ${res.data.id}!`);
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred registering the user.");
    }
  };

  const handleBorrow = async (bookId) => {
    setError("");
    setSuccess("");
    if (!userId) {
      setError("Please specify a User ID to borrow a book.");
      return;
    }
    try {
      await axios.post(`${API_URL}/books/borrow`, {
        user_id: parseInt(userId),
        book_id: bookId,
      });
      setSuccess(`Book borrowed successfully by User #${userId}!`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Error borrowing book.");
    }
  };

  const handleReturn = async (bookId, customUserId = null) => {
    setError("");
    setSuccess("");
    const activeUser = customUserId ? customUserId : parseInt(userId);
    
    if (!activeUser) {
      setError("Please specify a User ID to return a book.");
      return;
    }
    try {
      await axios.post(`${API_URL}/books/return`, {
        user_id: activeUser,
        book_id: bookId,
      });
      setSuccess(`Book returned successfully by User #${activeUser}!`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Error returning book.");
    }
  };

  const calculateDeadlineStatus = (borrowDateString) => {
    const borrowDate = new Date(borrowDateString);
    const dueDate = new Date(borrowDate);
    dueDate.setDate(borrowDate.getDate() + 14);
    
    const today = new Date();
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysRemaining < 0) {
      return {
        text: `OVERDUE (${Math.abs(daysRemaining)} days late)`,
        className: "bg-red-100 text-red-700 border-red-200",
        dueDateStr: dueDate.toLocaleDateString()
      };
    } else if (daysRemaining <= 3) {
      return {
        text: `${daysRemaining} days left!`,
        className: "bg-amber-100 text-amber-700 border-amber-200 font-bold animate-pulse",
        dueDateStr: dueDate.toLocaleDateString()
      };
    } else {
      return {
        text: `${daysRemaining} days remaining`,
        className: "bg-green-100 text-green-700 border-green-200",
        dueDateStr: dueDate.toLocaleDateString()
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 gap-4">
          <h1 className="text-4xl font-bold text-gray-800">📚 Library Management Dashboard</h1>
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                activeTab === "catalog" ? "bg-white text-gray-800 shadow" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Catalog & Circulation
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                activeTab === "users" ? "bg-white text-gray-800 shadow" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              User Directory
            </button>
          </div>
        </div>

        {/* Notifications */}
        {(error || success) && (
          <div className="font-medium transition space-y-2">
            {error && <div className="text-red-700 bg-red-100 p-3 rounded shadow-sm">{error}</div>}
            {success && <div className="text-green-700 bg-green-100 p-3 rounded shadow-sm">{success}</div>}
          </div>
        )}

        {/* CATALOG & CIRCULATION TAB */}
        {activeTab === "catalog" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">👤 Current Simulation User</h2>
                <div className="flex gap-2">
                  <span className="bg-gray-100 text-gray-700 px-3 py-2 border rounded font-mono">User ID:</span>
                  <input
                    type="number"
                    min="1"
                    className="w-20 p-2 border rounded text-center outline-none focus:ring-2 focus:ring-blue-500"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Book</h2>
                <form onSubmit={handleAddBook} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Title</label>
                    <input type="text" required className="w-full mt-1 p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                      value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Author</label>
                    <input type="text" required className="w-full mt-1 p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                      value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ISBN</label>
                    <input type="text" required className="w-full mt-1 p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                      value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Genre</label>
                      <input type="text" required className="w-full mt-1 p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                        value={bookForm.genre} onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Total Copies</label>
                      <input type="number" min="1" required className="w-full mt-1 p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                        value={bookForm.total_copies} onChange={(e) => setBookForm({ ...bookForm, total_copies: parseInt(e.target.value) || 1 })} />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded transition shadow">Add Book</button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Book Catalog Inventory</h2>
                {books.length === 0 ? (
                  <p className="text-gray-500 italic">No books in the catalog yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b text-gray-600 text-sm font-semibold">
                          <th className="p-3">Title Details</th>
                          <th className="p-3">Genre</th>
                          <th className="p-3 text-center">Available Stock</th>
                          <th className="p-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {books.map((book) => (
                          <tr key={book.id} className="border-b hover:bg-gray-50 transition">
                            <td className="p-3">
                              <div className="font-semibold text-gray-800">{book.title}</div>
                              <div className="text-xs text-gray-500">by {book.author} | ID: {book.id}</div>
                            </td>
                            <td className="p-3">
                              <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full font-medium text-gray-600">{book.genre}</span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`text-sm font-bold ${book.available_copies === 0 ? 'text-red-500' : 'text-emerald-600'}`}>{book.available_copies}</span>
                              <span className="text-xs text-gray-400"> / {book.total_copies}</span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleBorrow(book.id)}
                                disabled={book.available_copies === 0}
                                className={`text-xs font-semibold px-3 py-1.5 rounded transition shadow-sm ${
                                  book.available_copies === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"
                                }`}
                              >
                                Borrow
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Active Loans Panel with Rich Named Details and Deadlines */}
              <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-amber-500">
                <h2 className="text-xl font-semibold mb-2 text-gray-700">📋 Active Circulation Loans</h2>
                <p className="text-xs text-gray-500 mb-4">Lending window rules: 14 days maximum countdown.</p>
                {loans.length === 0 ? (
                  <p className="text-gray-400 italic text-sm py-2">No active outstanding loans tracked at this time.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 font-semibold border-b">
                          <th className="p-3">Loan ID</th>
                          <th className="p-3">Borrower Name</th>
                          <th className="p-3">Book Title</th>
                          <th className="p-3">Due Date</th>
                          <th className="p-3">Lending Window Status</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loans.map((loan) => {
                          const status = calculateDeadlineStatus(loan.borrow_date);
                          return (
                            <tr key={loan.id} className="border-b hover:bg-orange-50/40 transition">
                              <td className="p-3 font-mono font-bold text-gray-600">#{loan.id}</td>
                              <td className="p-3">
                                <div className="font-semibold text-gray-800">{loan.user?.name || `User #${loan.user_id}`}</div>
                                <div className="text-xs text-gray-400">ID: {loan.user_id}</div>
                              </td>
                              <td className="p-3">
                                <div className="font-medium text-gray-700">{loan.book?.title || `Book #${loan.book_id}`}</div>
                                <div className="text-xs text-gray-400">by {loan.book?.author || "Unknown"}</div>
                              </td>
                              <td className="p-3 font-medium text-gray-700">{status.dueDateStr}</td>
                              <td className="p-3">
                                <span className={`text-xs px-2.5 py-1 rounded border uppercase font-semibold ${status.className}`}>
                                  {status.text}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <button onClick={() => handleReturn(loan.book_id, loan.user_id)} className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded transition shadow-sm">
                                  Return
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* USER DIRECTORY TAB */}
        {activeTab === "users" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md self-start">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Register Library Member</h2>
              <form onSubmit={handleRegisterUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Full Name</label>
                  <input type="text" required className="w-full mt-1 p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                    value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email Address</label>
                  <input type="email" required className="w-full mt-1 p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                    value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Account Role</label>
                  <select className="w-full mt-1 p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} >
                    <option value="member">Member</option>
                    <option value="librarian">Librarian</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded transition shadow">Register User</button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Active Members Directory</h2>
              {users.length === 0 ? (
                <p className="text-gray-500 italic text-sm">No registered members found in the system database.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b text-gray-600 text-sm font-semibold">
                        <th className="p-3">User ID</th>
                        <th className="p-3">Name Details</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">System Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                          <td className="p-3 font-mono font-bold text-gray-500">#{user.id}</td>
                          <td className="p-3 font-semibold text-gray-800">{user.name}</td>
                          <td className="p-3 text-gray-600 font-mono text-xs">{user.email}</td>
                          <td className="p-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border uppercase ${
                              user.role === "admin" ? "bg-red-50 text-red-700 border-red-200" :
                              user.role === "librarian" ? "bg-purple-50 text-purple-700 border-purple-200" :
                              "bg-blue-50 text-blue-700 border-blue-200"
                            }`}>{user.role}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}