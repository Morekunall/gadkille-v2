import { useEffect, useState } from 'react';
import axios from '../lib/axiosAuth';

const HistoryManagementTab = ({ language, showToast, loading, forts }) => {
  const [histories, setHistories] = useState([]);
  const [historyForm, setHistoryForm] = useState({
    _id: null,
    fort: '',
    title: '',
    description: '',
    videoUrl: '',
    thumbnail: '',
    duration: '',
    isActive: true
  });
  const [savingHistory, setSavingHistory] = useState(false);
  const [loadingHistories, setLoadingHistories] = useState(true);

  useEffect(() => {
    fetchHistories();
  }, []);

  const fetchHistories = async () => {
    try {
      setLoadingHistories(true);
      const res = await axios.get(`/history`);
      setHistories(res.data || []);
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message ||
          (language === 'en'
            ? 'Unable to load history videos.'
            : 'हिस्ट्री व्हिडिओज लोड करता आले नाही.')
      );
    } finally {
      setLoadingHistories(false);
    }
  };

  const resetHistoryForm = () => {
    setHistoryForm({
      _id: null,
      fort: '',
      title: '',
      description: '',
      videoUrl: '',
      thumbnail: '',
      duration: '',
      isActive: true
    });
  };

  const startEditHistory = (history) => {
    setHistoryForm({
      _id: history._id,
      fort: history.fort?._id || '',
      title: history.title,
      description: history.description,
      videoUrl: history.videoUrl,
      thumbnail: history.thumbnail || '',
      duration: history.duration || '',
      isActive: history.isActive !== false
    });
  };

  const saveHistory = async (e) => {
    e.preventDefault();
    if (!historyForm.fort || !historyForm.title || !historyForm.description || !historyForm.videoUrl) {
      showToast(
        'error',
        language === 'en'
          ? 'Fort, title, description, and video URL are required.'
          : 'किल्ला, शीर्षक, वर्णन आणि व्हिडिओ URL आवश्यक आहे.'
      );
      return;
    }

    setSavingHistory(true);
    try {
      const payload = {
        fort: historyForm.fort,
        title: historyForm.title,
        description: historyForm.description,
        videoUrl: historyForm.videoUrl,
        thumbnail: historyForm.thumbnail,
        duration: historyForm.duration,
        isActive: historyForm.isActive
      };

      let res;
      if (historyForm._id) {
        res = await axios.put(
          `/history/${historyForm._id}`,
          payload
        );
      } else {
        res = await axios.post(`/history`, payload);
      }

      setHistories((prev) => {
        const exists = prev.some((h) => h._id === res.data._id);
        if (exists) {
          return prev.map((h) => (h._id === res.data._id ? res.data : h));
        }
        return [res.data, ...prev];
      });

      resetHistoryForm();
      showToast(
        'success',
        language === 'en' ? 'History video saved.' : 'हिस्ट्री व्हिडिओ सेव्ह झाली.'
      );
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message ||
          (language === 'en'
            ? 'Unable to save history video.'
            : 'हिस्ट्री व्हिडिओ सेव्ह करता आले नाही.')
      );
    } finally {
      setSavingHistory(false);
    }
  };

  const deleteHistory = async (history) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      language === 'en'
        ? `Delete history video "${history.title}"?`
        : `"${history.title}" हिस्ट्री व्हिडिओ हटवायची आहे का?`
    );
    if (!ok) return;

    try {
      await axios.delete(`/history/${history._id}`);
      setHistories((prev) => prev.filter((h) => h._id !== history._id));
      if (historyForm._id === history._id) resetHistoryForm();
      showToast(
        'success',
        language === 'en' ? 'History video deleted.' : 'हिस्ट्री व्हिडिओ हटवली.'
      );
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message ||
          (language === 'en'
            ? 'Unable to delete history video.'
            : 'हिस्ट्री व्हिडिओ हटवता आले नाही.')
      );
    }
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-primaryDark">
            {language === 'en' ? 'Short History Videos' : 'संक्षिप्त इतिहास व्हिडिओज'}
          </h2>
          <p className="mt-2 text-xs text-gray-500">
            {language === 'en'
              ? 'Add video links that will play in the Short History section on the homepage.'
              : 'व्हिडिओ लिंक्स जोडा जे होमपेजच्या संक्षिप्त इतिहास विभागात चेहरा करतील.'}
          </p>
        </div>
        <button
          onClick={resetHistoryForm}
          className="text-[11px] font-semibold text-primary hover:text-primaryDark"
        >
          {language === 'en' ? 'New video' : 'नवीन व्हिडिओ'}
        </button>
      </div>

      <form onSubmit={saveHistory} className="mt-4 grid gap-3 text-xs md:grid-cols-2">
        <div className="md:col-span-1">
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Fort' : 'किल्ला'} *
          </label>
          <select
            value={historyForm.fort}
            onChange={(e) => setHistoryForm((p) => ({ ...p, fort: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          >
            <option value="">
              {language === 'en' ? 'Select a fort' : 'किल्ला निवडा'}
            </option>
            {forts.map((fort) => (
              <option key={fort._id} value={fort._id}>
                {fort.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Title' : 'शीर्षक'} *
          </label>
          <input
            value={historyForm.title}
            onChange={(e) => setHistoryForm((p) => ({ ...p, title: e.target.value }))}
            placeholder={language === 'en' ? 'e.g., Lohagad Fort History' : 'उदा., लोहगड किल्ल्याचा इतिहास'}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Description' : 'वर्णन'} *
          </label>
          <textarea
            rows={2}
            value={historyForm.description}
            onChange={(e) => setHistoryForm((p) => ({ ...p, description: e.target.value }))}
            placeholder={language === 'en' ? 'Brief description of the video' : 'व्हिडिओचे संक्षिप्त वर्णन'}
            className="w-full resize-none rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Video URL' : 'व्हिडिओ URL'} *
          </label>
          <input
            value={historyForm.videoUrl}
            onChange={(e) => setHistoryForm((p) => ({ ...p, videoUrl: e.target.value }))}
            placeholder={language === 'en' ? 'https://www.youtube.com/embed/... or direct video link' : 'YouTube, Vimeo किंवा थेट व्हिडिओ लिंक'}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
          <p className="mt-1 text-[10px] text-gray-500">
            {language === 'en'
              ? 'Supports YouTube (youtube.com or youtu.be), Vimeo, or direct video links (mp4, webm)'
              : 'YouTube, Vimeo किंवा थेट व्हिडिओ लिंक्स समर्थित आहे'}
          </p>
        </div>

        <div className="md:col-span-1">
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Thumbnail URL' : 'थंबनेल URL'}
          </label>
          <input
            value={historyForm.thumbnail}
            onChange={(e) => setHistoryForm((p) => ({ ...p, thumbnail: e.target.value }))}
            placeholder={language === 'en' ? 'Optional: custom thumbnail image' : 'वैकल्पिक: कस्टम थंबनेल इमेज'}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="md:col-span-1">
          <label className="mb-1 block text-[11px] text-gray-700">
            {language === 'en' ? 'Duration' : 'अवधी'}
          </label>
          <input
            value={historyForm.duration}
            onChange={(e) => setHistoryForm((p) => ({ ...p, duration: e.target.value }))}
            placeholder={language === 'en' ? 'e.g., 5:30' : 'उदा., 5:30'}
            className="w-full rounded-xl border border-gray-200 bg-softBg px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-softBg px-3 py-2 text-[11px]">
            <input
              type="checkbox"
              checked={historyForm.isActive}
              onChange={(e) => setHistoryForm((p) => ({ ...p, isActive: e.target.checked }))}
            />
            {language === 'en' ? 'Active (visible on homepage)' : 'सक्रिय (होमपेजवर दृश्यमान)'}
          </label>
        </div>

        <div className="md:col-span-2 flex gap-2">
          <button
            type="submit"
            disabled={savingHistory}
            className="rounded-full bg-primary px-5 py-2 text-[11px] font-semibold text-white shadow-soft hover:bg-primaryDark disabled:opacity-60"
          >
            {savingHistory
              ? language === 'en'
                ? 'Saving...'
                : 'सेव्ह करत आहे...'
              : historyForm._id
              ? language === 'en'
                ? 'Update video'
                : 'व्हिडिओ अपडेट करा'
              : language === 'en'
              ? 'Add video'
              : 'व्हिडिओ जोडा'}
          </button>
          {historyForm._id && (
            <button
              type="button"
              onClick={resetHistoryForm}
              className="rounded-full bg-softBg px-5 py-2 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
            >
              {language === 'en' ? 'Cancel edit' : 'रद्द करा'}
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 space-y-2 text-[11px]">
        {loadingHistories ? (
          <div className="h-24 animate-pulse rounded-2xl bg-softBg" />
        ) : histories.length === 0 ? (
          <p className="text-gray-500">
            {language === 'en'
              ? 'No history videos added yet.'
              : 'अजून कोणतीही हिस्ट्री व्हिडिओ जोडलेली नाही.'}
          </p>
        ) : (
          histories.slice(0, 50).map((history) => (
            <div key={history._id} className="rounded-2xl bg-softBg px-3 py-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-primaryDark">
                    {history.title} · {history.fort?.name || 'Unknown Fort'}
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-600">
                    {history.description?.substring(0, 80)}...
                  </p>
                  <p className="mt-1 text-[10px] text-gray-500">
                    {history.duration ? `Duration: ${history.duration} · ` : ''}
                    {history.isActive
                      ? language === 'en'
                        ? 'Active ✓'
                        : 'सक्रिय ✓'
                      : language === 'en'
                      ? 'Inactive ✗'
                      : 'निष्क्रिय ✗'}
                  </p>
                  {history.videoUrl && (
                    <a
                      href={history.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-[10px] font-semibold text-primary hover:text-primaryDark"
                    >
                      {language === 'en' ? 'View video' : 'व्हिडिओ पहा'} ↗
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    onClick={() => startEditHistory(history)}
                    className="text-[10px] font-semibold text-primary hover:text-primaryDark"
                  >
                    {language === 'en' ? 'Edit' : 'संपादित'}
                  </button>
                  <button
                    onClick={() => deleteHistory(history)}
                    className="text-[10px] font-semibold text-red-600 hover:text-red-700"
                  >
                    {language === 'en' ? 'Delete' : 'हटवा'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryManagementTab;
