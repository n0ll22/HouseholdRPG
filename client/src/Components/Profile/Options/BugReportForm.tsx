import React, { useState } from "react";
import axios from "axios";
import { useUser } from "../../Auth/AuthContext/UserContext";
import { apiUrl } from "../../../Tools/types";

const BugReportForm: React.FC = () => {
  //Állapotváltozók létrehozása
  const user = useUser();
  //Email állapota
  const [email, setEmail] = useState<string | null>(user ? user.email : "");
  //Hibaüzenet tartalma
  const [description, setDescription] = useState("");
  //üzenet sikeresen elküldve
  const [success, setSuccess] = useState<string | null>(null);
  //hiba esetén megjelenítés
  const [error, setError] = useState<string | null>(null);
  //betöltés jezése
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      await axios.post(`${apiUrl}/api/report-bug`, { email, description });
      setSuccess("Bug report sent successfully.");
      setEmail("");
      setDescription("");
    } catch (err) {
      setError("Error... try again!.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-xl border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Bug Report</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Your email address
          </label>
          <input
            type="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={email ? email : ""}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bug Description:
          </label>
          <textarea
            required
            rows={5}
            className="mt-1 block w-full rounded-md border shadow-sm "
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-white hover:bg-gray-200 border py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Sending..." : "Report Bug"}
        </button>
        {success && <p className="text-green-600 text-sm">{success}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </div>
  );
};

export default BugReportForm;
