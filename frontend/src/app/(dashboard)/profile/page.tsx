'use client';

import { useEffect, useState } from 'react';
import { profileService, ProfileData, UpdateProfilePayload } from '@/services/profile.service';
import toast from 'react-hot-toast';
import { Loader2, Pencil, X, Save, User } from 'lucide-react';

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all';

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UpdateProfilePayload>({});

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<number>(3);
  const [addingSkill, setAddingSkill] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileService.getProfile();
      setProfile(res.data);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    if (!profile) return;
    setForm({
      name: profile.name,
      phone_number: profile.phone_number,
      designation: profile.designation,
      department: profile.department,
      bio: profile.bio,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      postal_code: profile.postal_code,
      country: profile.country,
      date_of_birth: profile.date_of_birth,
      gender: profile.gender,
      marital_status: profile.marital_status,
      emergency_contact_name: profile.emergency_contact_name,
      emergency_contact_phone: profile.emergency_contact_phone,
      emergency_contact_relationship: profile.emergency_contact_relationship,
    });
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await profileService.updateProfile(form);
      setProfile(res.data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UpdateProfilePayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value || null }));
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newSkillName.trim()) return;

    try {
      setAddingSkill(true);
      await profileService.addSkill(profile.id, {
        skill_name: newSkillName,
        proficiency: newSkillProficiency,
      });
      fetchProfile();
      setNewSkillName('');
      setNewSkillProficiency(3);
      toast.success('Skill added successfully');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to add skill');
    } finally {
      setAddingSkill(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
    );
  }

  if (!profile) return null;

  const InfoRow = ({ label, value }: { label: string; value: string | null }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 sm:w-48 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 mt-0.5 sm:mt-0">{value || '—'}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-0.5">View and manage your profile information</p>
        </div>
        {!editing ? (
          <button
            onClick={startEditing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            <Pencil className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {editing ? (
        /* Edit Mode — all inputs inline, no sub-components */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name ?? ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="John Doe"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={form.phone_number ?? ''}
                  onChange={(e) => handleChange('phone_number', e.target.value)}
                  placeholder="+91-9876543210"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Designation</label>
                <input
                  type="text"
                  value={form.designation ?? ''}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  placeholder="Senior Developer"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                <input
                  type="text"
                  value={form.department ?? ''}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="Engineering"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={form.date_of_birth ?? ''}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                <select
                  value={form.gender ?? ''}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Marital Status</label>
                <select
                  value={form.marital_status ?? ''}
                  onChange={(e) => handleChange('marital_status', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
              <textarea
                value={form.bio ?? ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Short professional bio..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                <input
                  type="text"
                  value={form.address ?? ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="123 Tech Street"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={form.city ?? ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Bangalore"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <input
                  type="text"
                  value={form.state ?? ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="Karnataka"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code</label>
                <input
                  type="text"
                  value={form.postal_code ?? ''}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  placeholder="560001"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                <input
                  type="text"
                  value={form.country ?? ''}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="India"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Name</label>
                <input
                  type="text"
                  value={form.emergency_contact_name ?? ''}
                  onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                  placeholder="Priya Sharma"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Phone</label>
                <input
                  type="text"
                  value={form.emergency_contact_phone ?? ''}
                  onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                  placeholder="+91-9876543211"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Relationship</label>
                <input
                  type="text"
                  value={form.emergency_contact_relationship ?? ''}
                  onChange={(e) => handleChange('emergency_contact_relationship', e.target.value)}
                  placeholder="Sister"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* View Mode */
        <div className="space-y-6">
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-gray-500 text-sm">{profile.email}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    {profile.role}
                  </span>
                  {profile.department && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {profile.department}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
            <InfoRow label="Designation" value={profile.designation} />
            <InfoRow label="Phone Number" value={profile.phone_number} />
            <InfoRow label="Date of Birth" value={profile.date_of_birth} />
            <InfoRow label="Gender" value={profile.gender} />
            <InfoRow label="Marital Status" value={profile.marital_status} />
            <InfoRow label="Bio" value={profile.bio} />
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Address</h3>
            <InfoRow label="Street" value={profile.address} />
            <InfoRow label="City" value={profile.city} />
            <InfoRow label="State" value={profile.state} />
            <InfoRow label="Postal Code" value={profile.postal_code} />
            <InfoRow label="Country" value={profile.country} />
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Emergency Contact</h3>
            <InfoRow label="Name" value={profile.emergency_contact_name} />
            <InfoRow label="Phone" value={profile.emergency_contact_phone} />
            <InfoRow label="Relationship" value={profile.emergency_contact_relationship} />
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Skills</h3>
            
            <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                type="text"
                placeholder="E.g. JavaScript"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
              <select
                value={newSkillProficiency}
                onChange={(e) => setNewSkillProficiency(Number(e.target.value))}
                className="w-full sm:w-40 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              >
                <option value={1}>Beginner (1)</option>
                <option value={2}>Novice (2)</option>
                <option value={3}>Intermediate (3)</option>
                <option value={4}>Advanced (4)</option>
                <option value={5}>Expert (5)</option>
              </select>
              <button
                type="submit"
                disabled={addingSkill || !newSkillName.trim()}
                className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {addingSkill ? 'Adding...' : 'Add Skill'}
              </button>
            </form>

            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <div key={skill.id} className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 capitalize">{skill.skill_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                      Lvl {skill.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">No skills added yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
