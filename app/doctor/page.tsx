// /app/doctor/page.tsx (Corrected)
'use client';

import { useEffect, useState } from 'react';
import { Search, Check } from 'lucide-react';
import Image from 'next/image';
import { apiClient } from '../../utils/auth';

type Doctor = {
    id: string;
    name: string;
    image?: string;
};

type ApiDoctorData = {
    id: string | number;
    doctor_id: string | number;
    name: string;
    doctor_name: string;
    profile_image: string;
};

type Patient = {
    user_id?: string;
    uhid?: string;
    name?: string;
    mobile_number?: string;
    assigned_doctor?: string;
    assigned_counselor?: string;
};

export default function Doctor() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState<boolean>(false);
    const [doctorsError, setDoctorsError] = useState<string>('');

    const [isSearchingPatient, setIsSearchingPatient] = useState<boolean>(false);
    const [patientError, setPatientError] = useState<string>('');
    const [patient, setPatient] = useState<Patient | null>(null);

    const [isChangingDoctor, setIsChangingDoctor] = useState<boolean>(false);
    const [changeDoctorError, setChangeDoctorError] = useState<string>('');
    const [changeDoctorSuccess, setChangeDoctorSuccess] = useState<string>('');

    const selectedDoctorName = doctors.find((d) => d.id === selectedDoctor)?.name;

    useEffect(() => {
        const fetchDoctors = async () => {
            setIsLoadingDoctors(true);
            setDoctorsError('');
            try {
                // ✅ FIX: Typed the 'response' variable, not the function call.
                const response: { data: ApiDoctorData[] } = await apiClient.get('https://hivfstage.surya-app.com/appointment/api/v1/doctor_list/');
                const list = response?.data || [];
                
                const normalized: Doctor[] = list.map((item: ApiDoctorData, index: number) => ({
                    id: String(item.id ?? item.doctor_id ?? index + 1),
                    name: String(item.name ?? item.doctor_name ?? 'Unknown Doctor'),
                    image: item.profile_image,
                }));
                
                setDoctors(normalized);
                if (normalized.length > 0) {
                    setSelectedDoctor(normalized[0].id);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to load doctor list';
                setDoctorsError(message);
            } finally {
                setIsLoadingDoctors(false);
            }
        };
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (!patient?.assigned_doctor || doctors.length === 0) return;
        const found = doctors.find(d => d.name?.toLowerCase().trim() === String(patient.assigned_doctor).toLowerCase().trim());
        if (found) {
            setSelectedDoctor(found.id);
        }
    }, [patient, doctors]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setPatientError('Please enter UHID');
            return;
        }
        setIsSearchingPatient(true);
        setPatientError('');
        setShowDetails(false);
        setPatient(null);

        try {
            const url = `https://hivfstage.surya-app.com/admin_dashboard/api/v1/find-patient/?uhid=${encodeURIComponent(searchTerm.trim())}`;
            // ✅ FIX: Typed the 'res' variable.
            const res: { data: Patient; message?: string } = await apiClient.get(url);
            
            if (res?.data) {
                setPatient(res.data);
                setShowDetails(true);
            } else if (res?.message) {
                setPatientError(res.message);
            } else {
                setPatientError('Patient not found');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to search patient';
            setPatientError(message);
        } finally {
            setIsSearchingPatient(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleDoctorSelect = (doctorId: string) => {
        setSelectedDoctor(doctorId);
    };

    const handleSubmit = async () => {
        setChangeDoctorError('');
        setChangeDoctorSuccess('');
        if (!patient?.user_id) {
            setChangeDoctorError('Please search and select a patient first.');
            return;
        }
        if (!selectedDoctor) {
            setChangeDoctorError('Please select a doctor.');
            return;
        }
        setIsChangingDoctor(true);
        try {
            const url = 'https://hivfstage.surya-app.com/admin_dashboard/api/v1/change-doctor/';
            const payload = {
                user_id: patient.user_id,
                doctor_id: selectedDoctor,
            };
            // ✅ FIX: Typed the 'res' variable.
            const res: { message?: string } = await apiClient.patch(url, payload);
            
            if (res?.message) {
                setChangeDoctorSuccess(res.message);
            } else {
                setChangeDoctorSuccess('Doctor changed successfully');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to change doctor';
            setChangeDoctorError(message);
        } finally {
            setIsChangingDoctor(false);
        }
    };

    const handleCancel = () => {
        setShowDetails(false);
        setSearchTerm('');
        setPatient(null);
        setPatientError('');
    };

    // ... The rest of your JSX remains the same ...
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Patient Search
          </h1>
          <div className="flex gap-0 shadow-sm">
            <input
              type="text"
              placeholder="Search UHID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 bg-white"
            />
            <button
              onClick={handleSearch}
              className="bg-black text-white px-6 py-3 rounded-r-md hover:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Patient Details and Doctor List */}
        {showDetails && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-blue-600 mb-4 border-b border-gray-200 pb-2">
                  Patient Details
                </h2>
                <div className="space-y-3">
                  {isSearchingPatient && <div className="text-gray-600 text-sm">Searching...</div>}
                  {patientError && !isSearchingPatient && <div className="text-red-600 text-sm">{patientError}</div>}
                  {patient && !isSearchingPatient && (
                    <>
                      <div className="flex">
                        <span className="font-medium text-gray-700 w-40">Patient Name:</span>
                        <span className="text-gray-900">{patient.name}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-700 w-40">Patient UHID:</span>
                        <span className="text-gray-900">{patient.uhid}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-700 w-40">Mobile Number:</span>
                        <span className="text-gray-900">{patient.mobile_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700 w-40">Assigned Doctor:</span>
                        {selectedDoctorName ? (
                          <span className="inline-flex items-center gap-2 text-gray-900">
                            {selectedDoctorName}
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Selected</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-gray-900">
                            {patient.assigned_doctor}
                            {patient.assigned_doctor && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">Current</span>
                            )}
                          </span>
                        )}
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-700 w-40">Assigned Counselor:</span>
                        <span className="text-gray-900">{patient.assigned_counselor}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Doctor List */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-blue-600 mb-4 border-b border-gray-200 pb-2">
                  Doctor List
                </h2>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {isLoadingDoctors && <div className="text-gray-600 text-sm">Loading doctors...</div>}
                  {!isLoadingDoctors && doctorsError && <div className="text-red-600 text-sm">{doctorsError}</div>}
                  {!isLoadingDoctors && !doctorsError && doctors.length === 0 && (
                    <div className="text-gray-600 text-sm">No doctors found.</div>
                  )}
                  {!isLoadingDoctors && !doctorsError && doctors.map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Image
                          src={doctor.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face'}
                          alt={doctor.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium text-gray-900 flex items-center gap-2">
                          {doctor.name}
                          {selectedDoctor === doctor.id && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Selected</span>
                          )}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDoctorSelect(doctor.id)}
                        className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedDoctor === doctor.id
                            ? 'bg-green-600 text-white flex items-center gap-1'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {selectedDoctor === doctor.id ? (<><Check size={14} />Selected</>) : ('Select')}
                      </button>
                    </div>
                  ))}
                </div>
                {(changeDoctorError || changeDoctorSuccess) && (
                  <div className={`mt-4 text-sm ${changeDoctorError ? 'text-red-600' : 'text-green-700'}`}>
                    {changeDoctorError || changeDoctorSuccess}
                  </div>
                )}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button onClick={handleCancel} className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isChangingDoctor}
                    className={`px-6 py-2 rounded-md transition-colors text-white ${isChangingDoctor ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isChangingDoctor ? 'Updating...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}