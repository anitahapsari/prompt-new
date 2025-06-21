
import React, { useState, useCallback } from 'react';
import { FormData, CharacterDetail } from './types';
import { MAX_CHARACTERS, CAMERA_MOVEMENT_OPTIONS, LIGHTING_OPTIONS, VIDEO_STYLE_OPTIONS } from './constants';
import InputField from './components/InputField';
import TextAreaField from './components/TextAreaField';
import SelectField from './components/SelectField';
import { enhancePromptIndonesian, translatePromptEnglish } from './services/GeminiService'; // Ensured relative path

const initialCharacterDetail: CharacterDetail = {
  description: '',
  voice: '',
  action: '',
  expression: '',
  dialogue: '',
};

const initialFormData: FormData = {
  sceneTitle: '',
  characters: Array(MAX_CHARACTERS).fill(null).map(() => ({ ...initialCharacterDetail })),
  setting: '',
  cameraMovement: '',
  lighting: '',
  videoStyle: '',
  overallMood: '',
  ambientSound: '',
  additionalDetails: '',
};

// Loading spinner SVG - moved to module scope
const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [generatedIndonesianPrompt, setGeneratedIndonesianPrompt] = useState<string>('');
  const [generatedEnglishPrompt, setGeneratedEnglishPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCharacterChange = (index: number, field: keyof CharacterDetail, value: string) => {
    setFormData(prev => {
      const newCharacters = [...prev.characters];
      newCharacters[index] = { ...newCharacters[index], [field]: value };
      return { ...prev, characters: newCharacters };
    });
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedIndonesianPrompt('');
    setGeneratedEnglishPrompt('');

    try {
      const enhancedIndonesian = await enhancePromptIndonesian(formData);
      setGeneratedIndonesianPrompt(enhancedIndonesian);
      const translatedEnglish = await translatePromptEnglish(enhancedIndonesian);
      setGeneratedEnglishPrompt(translatedEnglish);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menghasilkan prompt.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const characterInputFields = (charIndex: number, charDetail: CharacterDetail) => {
    const fieldSet = [
      { id: `char${charIndex}_description`, label: `Deskripsi Karakter ${charIndex + 1}`, field: 'description', value: charDetail.description, placeholder: `Contoh: Pria paruh baya, rambut ikal, memakai jas hujan` },
      { id: `char${charIndex}_voice`, label: `Detail Suara Karakter ${charIndex + 1}`, field: 'voice', value: charDetail.voice, placeholder: `Contoh: Berat, serak, dan berwibawa`  },
      { id: `char${charIndex}_action`, label: `Aksi Karakter ${charIndex + 1}`, field: 'action', value: charDetail.action, placeholder: `Contoh: Berjalan tergesa-gesa di tengah hujan` },
      { id: `char${charIndex}_expression`, label: `Ekspresi Karakter ${charIndex + 1}`, field: 'expression', value: charDetail.expression, placeholder: `Contoh: Cemas dan sedikit ketakutan` },
      { id: `char${charIndex}_dialogue`, label: `Dialog Karakter ${charIndex + 1}`, field: 'dialogue', value: charDetail.dialogue, placeholder: `Contoh: "Kita harus segera pergi dari sini!"`, type: 'textarea' },
    ] as const;
    
    return fieldSet.map(f => (
        ('type' in f && f.type === 'textarea') ?
        <TextAreaField
            key={f.id}
            label={f.label}
            id={f.id}
            value={f.value}
            onChange={(e) => handleCharacterChange(charIndex, f.field, e.target.value)}
            placeholder={f.placeholder}
            rows={2}
        />
        :
        <InputField
            key={f.id}
            label={f.label}
            id={f.id}
            value={f.value}
            onChange={(e) => handleCharacterChange(charIndex, f.field, e.target.value)}
            placeholder={f.placeholder}
        />
    ));
  };


  return (
    <div className="bg-slate-900 text-slate-200 min-h-screen py-1"> {/* Added py-1 to prevent margin collapse with child */}
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 py-2">
            Aplikasi Prompter Konsisten Multikarakter
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Hasilkan prompt video Veo 3 yang detail dan memukau.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8 bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl">
          
          <section>
            <h2 className="text-2xl font-semibold text-sky-400 border-b border-slate-700 pb-2 mb-6">Informasi Dasar Adegan</h2>
            <InputField
              label="Judul Scene"
              id="sceneTitle"
              value={formData.sceneTitle}
              onChange={handleInputChange}
              placeholder="Contoh: Pertemuan di Kafe Tengah Malam"
            />
            <TextAreaField
              label="Latar Tempat & Waktu"
              id="setting"
              value={formData.setting}
              onChange={handleInputChange}
              placeholder="Contoh: Sebuah kafe tua di pinggir kota, pukul 2 pagi, hujan deras di luar."
              rows={2}
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-sky-400 border-b border-slate-700 pb-2 mb-6">Detail Karakter (Hingga {MAX_CHARACTERS} Karakter)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
              {formData.characters.map((char, index) => (
                <div key={index} className="p-4 border border-slate-700 rounded-lg bg-slate-800/50 space-y-3">
                  <h3 className="text-lg font-medium text-cyan-400">Karakter {index + 1}</h3>
                  {characterInputFields(index, char)}
                </div>
              ))}
            </div>
          </section>


          <section>
            <h2 className="text-2xl font-semibold text-sky-400 border-b border-slate-700 pb-2 mb-6">Elemen Sinematik</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SelectField
                label="Gerakan Kamera"
                id="cameraMovement"
                value={formData.cameraMovement}
                onChange={handleInputChange}
                options={CAMERA_MOVEMENT_OPTIONS}
              />
              <SelectField
                label="Pencahayaan"
                id="lighting"
                value={formData.lighting}
                onChange={handleInputChange}
                options={LIGHTING_OPTIONS}
              />
              <SelectField
                label="Gaya Video"
                id="videoStyle"
                value={formData.videoStyle}
                onChange={handleInputChange}
                options={VIDEO_STYLE_OPTIONS}
              />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-sky-400 border-b border-slate-700 pb-2 mb-6">Suasana & Suara</h2>
              <TextAreaField
                label="Suasana Keseluruhan"
                id="overallMood"
                value={formData.overallMood}
                onChange={handleInputChange}
                placeholder="Contoh: Tegang, misterius, dengan sedikit nuansa melankolis."
                rows={2}
              />
              <TextAreaField
                label="Suara Lingkungan"
                id="ambientSound"
                value={formData.ambientSound}
                onChange={handleInputChange}
                placeholder="Contoh: Suara hujan, dengungan lampu neon, musik jazz pelan dari radio."
                rows={2}
              />
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-sky-400 border-b border-slate-700 pb-2 mb-6">Detail Tambahan</h2>
            <TextAreaField
              label="Detail Tambahan"
              id="additionalDetails"
              value={formData.additionalDetails}
              onChange={handleInputChange}
              placeholder="Contoh: Fokus pada ekspresi mata karakter, ada objek penting di atas meja."
              rows={3}
            />
          </section>

          <div className="pt-6 text-center">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              {isLoading && <LoadingSpinner />}
              {isLoading ? 'Menghasilkan...' : 'Hasilkan Prompt'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-8 p-4 bg-red-900 border border-red-700 text-red-100 rounded-md">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {(generatedIndonesianPrompt || generatedEnglishPrompt) && (
          <div className="mt-12 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-sky-400 mb-3">Prompt Video (Bahasa Indonesia - Dapat Diedit)</h2>
              <TextAreaField
                label=""
                id="generatedIndonesianPrompt"
                value={generatedIndonesianPrompt}
                onChange={(e) => setGeneratedIndonesianPrompt(e.target.value)}
                rows={10}
                placeholder="Prompt Bahasa Indonesia akan muncul di sini..."
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-sky-400 mb-3">Final Prompt (English - Non-Editable)</h2>
              <TextAreaField
                label=""
                id="generatedEnglishPrompt"
                value={generatedEnglishPrompt}
                onChange={() => {}} // No-op for readOnly
                rows={10}
                readOnly
                placeholder="Prompt Bahasa Inggris akan muncul di sini..."
              />
            </div>
          </div>
        )}
        <footer className="text-center mt-12 py-6 border-t border-slate-700">
          <p className="text-slate-500 text-sm">
            Dibangun dengan React, Tailwind CSS, dan Gemini API.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
