import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { ConfirmationModal } from "./ConfirmationModal";
import { Pet, Customer, PetSpecies } from "../types";
import {
  Dog as DogIcon,
  Cat as CatIcon,
  Bird as BirdIcon,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  Info
} from "lucide-react";

export const PetsView: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [speciesFilter, setSpeciesFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  // Common Fields
  const [species, setSpecies] = useState<PetSpecies>("DOG");
  const [name, setName] = useState<string>("");
  const [breed, setBreed] = useState<string>("");
  const [weight, setWeight] = useState<number>(20);
  const [age, setAge] = useState<number>(3);
  const [gender, setGender] = useState<string>("Male");
  const [customerId, setCustomerId] = useState<number | "">("");
  const [medicalConditions, setMedicalConditions] = useState<string>("None");
  const [allergies, setAllergies] = useState<string>("None");
  const [behavioralNotes, setBehavioralNotes] = useState<string>("");
  const [groomingPreferences, setGroomingPreferences] = useState<string>("");

  // Subclass Specific Fields
  // Dog
  const [coatType, setCoatType] = useState<string>("Standard");
  const [requiresHandlingMuzzle, setRequiresHandlingMuzzle] = useState<boolean>(false);

  // Cat
  const [indoorOnly, setIndoorOnly] = useState<boolean>(true);
  const [declawed, setDeclawed] = useState<boolean>(false);
  const [mattingSeverity, setMattingSeverity] = useState<string>("NONE");

  // Bird
  const [wingClippingNeeded, setWingClippingNeeded] = useState<boolean>(false);
  const [beakCondition, setBeakCondition] = useState<string>("HEALTHY");
  const [cageTrained, setCageTrained] = useState<boolean>(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [petsRes, custsRes] = await Promise.all([
        api.get("/pets"),
        api.get("/customers")
      ]);
      setPets(petsRes.data);
      setCustomers(custsRes.data);
    } catch (err) {
      console.error("Failed to load pets", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewModal = () => {
    setEditingPet(null);
    setSpecies("DOG");
    setName("");
    setBreed("");
    setWeight(25);
    setAge(3);
    setGender("Male");
    setCustomerId(customers[0]?.id || "");
    setMedicalConditions("None");
    setAllergies("None");
    setBehavioralNotes("");
    setGroomingPreferences("");

    // Dog defaults
    setCoatType("Standard");
    setRequiresHandlingMuzzle(false);

    // Cat defaults
    setIndoorOnly(true);
    setDeclawed(false);
    setMattingSeverity("NONE");

    // Bird defaults
    setWingClippingNeeded(false);
    setBeakCondition("HEALTHY");
    setCageTrained(true);

    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Pet) => {
    setEditingPet(p);
    setSpecies(p.species);
    setName(p.name);
    setBreed(p.breed);
    setWeight(p.weight);
    setAge(p.age);
    setGender(p.gender);
    setCustomerId(p.customerId);
    setMedicalConditions(p.medicalConditions || "None");
    setAllergies(p.allergies || "None");
    setBehavioralNotes(p.behavioralNotes || "");
    setGroomingPreferences(p.groomingPreferences || "");

    setCoatType(p.coatType || "Standard");
    setRequiresHandlingMuzzle(Boolean(p.requiresHandlingMuzzle));

    setIndoorOnly(p.indoorOnly !== undefined ? p.indoorOnly : true);
    setDeclawed(Boolean(p.declawed));
    setMattingSeverity(p.mattingSeverity || "NONE");

    setWingClippingNeeded(Boolean(p.wingClippingNeeded));
    setBeakCondition(p.beakCondition || "HEALTHY");
    setCageTrained(p.cageTrained !== undefined ? p.cageTrained : true);

    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSavePet = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerId) {
      setErrorMessage("Please select a pet owner (customer).");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        species,
        name,
        breed,
        weight: Number(weight),
        age: Number(age),
        gender,
        customerId: Number(customerId),
        medicalConditions,
        allergies,
        behavioralNotes,
        groomingPreferences,
        coatType,
        requiresHandlingMuzzle,
        indoorOnly,
        declawed,
        mattingSeverity,
        wingClippingNeeded,
        beakCondition,
        cageTrained
      };

      if (editingPet) {
        await api.put(`/pets/${editingPet.id}`, payload);
      } else {
        await api.post("/pets", payload);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to save pet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePet = (p: Pet) => {
    setPetToDelete(p);
  };

  const handleConfirmDeletePet = async () => {
    if (!petToDelete) return;
    try {
      await api.delete(`/pets/${petToDelete.id}`);
      setPetToDelete(null);
      loadData();
    } catch (err) {
      console.error("Failed to delete pet", err);
    }
  };

  const filteredPets = pets.filter(p => {
    if (speciesFilter !== "ALL" && p.species !== speciesFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.breed.toLowerCase().includes(q) ||
      p.customerName?.toLowerCase().includes(q) ||
      p.groomingPreferences.toLowerCase().includes(q)
    );
  });

  const getSpeciesIcon = (spec: PetSpecies) => {
    switch (spec) {
      case "CAT":
        return <CatIcon className="w-4 h-4 text-amber-600" />;
      case "BIRD":
        return <BirdIcon className="w-4 h-4 text-indigo-600" />;
      default:
        return <DogIcon className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Pet Directory</h1>
          <p className="text-sm text-stone-500">
            Client pets, breed profiles, coat characteristics, and special handling instructions.
          </p>
        </div>
        <button
          id="btn-register-pet"
          onClick={handleOpenNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register Pet</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            id="input-search-pets"
            type="text"
            placeholder="Search by name, breed, owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
          />
        </div>

        {/* Species Filter Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200 w-full sm:w-auto justify-center">
          {["ALL", "DOG", "CAT", "BIRD"].map((spec) => (
            <button
              key={spec}
              onClick={() => setSpeciesFilter(spec)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                speciesFilter === spec
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {spec === "ALL" ? "All Pets" : spec.charAt(0) + spec.slice(1).toLowerCase() + "s"}
            </button>
          ))}
        </div>
      </div>

      {/* Pets Grid */}
      {loading ? (
        <div className="p-12 text-center text-stone-500 text-sm">Loading pet registry...</div>
      ) : filteredPets.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-xs">
          <DogIcon className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-800 font-semibold text-sm">No pets found</p>
          <p className="text-stone-500 text-xs mt-1">Register a new pet to begin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPets.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
                      {getSpeciesIcon(p.species)}
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-base leading-tight">{p.name}</h3>
                      <span className="text-xs text-stone-500">{p.breed}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1 text-stone-400 hover:text-stone-800 rounded"
                      title="Edit Pet"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePet(p)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded"
                      title="Delete Pet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Pet Attributes Pill Bar */}
                <div className="flex flex-wrap gap-1.5 mt-3 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                    {p.weight} lbs ({p.weight < 15 ? "Small" : p.weight <= 40 ? "Medium" : p.weight <= 70 ? "Large" : "Giant"})
                  </span>
                  <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                    {p.age} yrs • {p.gender}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-medium">
                    Owner: {p.customerName}
                  </span>
                </div>

                {/* Species-Specific Care Details */}
                <div className="mt-3 p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 text-xs space-y-1">
                  <span className="font-semibold text-stone-700 block text-[11px] uppercase tracking-wider">
                    {p.species} Specific Profile
                  </span>

                  {p.species === "DOG" && (
                    <div className="text-stone-600 text-xs space-y-0.5">
                      <div>Coat Type: <strong>{p.coatType || "Standard"}</strong></div>
                      {p.requiresHandlingMuzzle ? (
                        <div className="text-amber-700 font-semibold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Requires safety muzzle during grooming
                        </div>
                      ) : (
                        <div className="text-stone-500">No muzzle required</div>
                      )}
                    </div>
                  )}

                  {p.species === "CAT" && (
                    <div className="text-stone-600 text-xs space-y-0.5">
                      <div>
                        Matting Severity:{" "}
                        <strong className={p.mattingSeverity === "SEVERE" ? "text-rose-600" : "text-stone-800"}>
                          {p.mattingSeverity || "NONE"}
                        </strong>
                      </div>
                      <div>{p.indoorOnly ? "Indoor pet" : "Outdoor pet"} • {p.declawed ? "Declawed" : "Intact claws"}</div>
                    </div>
                  )}

                  {p.species === "BIRD" && (
                    <div className="text-stone-600 text-xs space-y-0.5">
                      <div>Beak Condition: <strong>{p.beakCondition || "HEALTHY"}</strong></div>
                      <div>Wing Clipping: <strong>{p.wingClippingNeeded ? "Required" : "Not needed"}</strong></div>
                      <div>{p.cageTrained ? "Cage trained" : "Not cage trained"}</div>
                    </div>
                  )}
                </div>

                {/* Special Care Protocol Output */}
                {p.specialCareInstructions && (
                  <div className="mt-2.5 text-[11px] text-teal-900 bg-teal-50/70 p-2 rounded-md border border-teal-100">
                    <strong className="block font-semibold">Special Care Protocol:</strong>
                    {p.specialCareInstructions}
                  </div>
                )}
              </div>

              {p.groomingPreferences && (
                <div className="mt-3 pt-2.5 border-t border-stone-100 text-[11px] text-stone-500">
                  <span className="font-semibold text-stone-700">Styling Preference:</span> {p.groomingPreferences}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Pet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-bold text-stone-900 text-base">
                {editingPet ? "Edit Pet Profile" : "Register New Pet"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSavePet} className="mt-4 space-y-3.5">
              {/* Species Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Pet Species</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "DOG", label: "Dog", icon: DogIcon },
                    { id: "CAT", label: "Cat", icon: CatIcon },
                    { id: "BIRD", label: "Bird", icon: BirdIcon }
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => setSpecies(s.id as PetSpecies)}
                        className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-semibold transition-all ${
                          species === s.id
                            ? "bg-teal-50 border-teal-500 text-teal-900 shadow-xs"
                            : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Owner Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Owner (Customer)</label>
                <select
                  id="input-pet-customer"
                  value={customerId}
                  onChange={(e) => setCustomerId(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                  ))}
                </select>
              </div>

              {/* Name & Breed */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Pet Name</label>
                  <input
                    id="input-pet-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Breed</label>
                  <input
                    id="input-pet-breed"
                    type="text"
                    required
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                  />
                </div>
              </div>

              {/* Weight, Age, Gender */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Weight (lbs)</label>
                  <input
                    id="input-pet-weight"
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Age (Years)</label>
                  <input
                    id="input-pet-age"
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Gender</label>
                  <select
                    id="input-pet-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              {/* DYNAMIC SUBCLASS SPECIFIC INPUTS */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                <span className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  {species} Care & Grooming Specifications
                </span>

                {species === "DOG" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Coat Type</label>
                      <select
                        value={coatType}
                        onChange={(e) => setCoatType(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900"
                      >
                        <option value="Standard">Standard Smooth</option>
                        <option value="Double Coat">Double Coat (Husky/Golden: +15% labor)</option>
                        <option value="Curly/Wire">Curly/Wire (Poodle/Bichon: +15% labor)</option>
                        <option value="Short Smooth">Short Smooth</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requiresHandlingMuzzle}
                          onChange={(e) => setRequiresHandlingMuzzle(e.target.checked)}
                          className="rounded text-teal-600"
                        />
                        <span className="font-medium">Requires Handling Muzzle ($15 surcharge)</span>
                      </label>
                    </div>
                  </div>
                )}

                {species === "CAT" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Matting Severity</label>
                      <select
                        value={mattingSeverity}
                        onChange={(e) => setMattingSeverity(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900"
                      >
                        <option value="NONE">None ($0)</option>
                        <option value="MILD">Mild (+$7.50)</option>
                        <option value="MODERATE">Moderate (+$15.00)</option>
                        <option value="SEVERE">Severe (+$25.00)</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={indoorOnly}
                          onChange={(e) => setIndoorOnly(e.target.checked)}
                          className="rounded text-teal-600"
                        />
                        <span>Indoor Only</span>
                      </label>
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={declawed}
                          onChange={(e) => setDeclawed(e.target.checked)}
                          className="rounded text-teal-600"
                        />
                        <span>Declawed</span>
                      </label>
                    </div>
                  </div>
                )}

                {species === "BIRD" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">Beak Condition</label>
                      <select
                        value={beakCondition}
                        onChange={(e) => setBeakCondition(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900"
                      >
                        <option value="HEALTHY">Healthy</option>
                        <option value="OVERGROWN">Overgrown (+$12 filing)</option>
                        <option value="CHIPPED">Chipped</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wingClippingNeeded}
                          onChange={(e) => setWingClippingNeeded(e.target.checked)}
                          className="rounded text-teal-600"
                        />
                        <span>Wing Trim Needed (+$10)</span>
                      </label>
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cageTrained}
                          onChange={(e) => setCageTrained(e.target.checked)}
                          className="rounded text-teal-600"
                        />
                        <span>Cage Trained</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Grooming Preferences */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Grooming & Styling Notes</label>
                <input
                  type="text"
                  value={groomingPreferences}
                  onChange={(e) => setGroomingPreferences(e.target.value)}
                  placeholder="Shampoo preference, coat cut length, ear cleaning..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-pet"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : (editingPet ? "Update Pet" : "Register Pet")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Pet Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!petToDelete}
        title="Delete Pet Profile"
        message={
          petToDelete
            ? `Are you sure you want to delete ${petToDelete.name} (${petToDelete.species}, ${petToDelete.breed})? Any upcoming appointments for this pet will also be cancelled.`
            : ""
        }
        confirmLabel="Delete Pet"
        isDestructive={true}
        onConfirm={handleConfirmDeletePet}
        onClose={() => setPetToDelete(null)}
      />
    </div>
  );
};
