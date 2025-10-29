import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { alertsAPI, UpdateAlertData } from '../api/alerts';
import './AlertForm.css';

function EditAlert() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UpdateAlertData>({
    name: '',
    description: '',
    type: 'PRICE',
    symbol: '',
    operator: 'ABOVE',
    threshold: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAlert();
    }
  }, [id]);

  const fetchAlert = async () => {
    try {
      const alert = await alertsAPI.getAlert(id!);
      setFormData({
        name: alert.name,
        description: alert.description || '',
        type: alert.type,
        symbol: alert.symbol,
        operator: alert.operator,
        threshold: alert.threshold,
        isActive: alert.isActive,
      });
    } catch (err) {
      setError('Failed to load alert');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await alertsAPI.updateAlert(id!, formData);
      navigate('/alerts');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update alert');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'threshold' ? parseFloat(value) : value,
    }));
  };

  if (loading) {
    return <div className="alert-form-page">Loading...</div>;
  }

  return (
    <div className="alert-form-page">
      <div className="form-header">
        <h1>Edit Alert</h1>
        <button onClick={() => navigate('/alerts')} className="btn-secondary">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="alert-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="name">
            Alert Name <span className="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., BTC Price Alert"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional description"
            maxLength={500}
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">
              Alert Type <span className="required">*</span>
            </label>
            <select id="type" name="type" value={formData.type} onChange={handleChange}>
              <option value="PRICE">Price</option>
              <option value="VOLATILITY">Volatility</option>
              <option value="ROI">ROI</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="symbol">
              Symbol <span className="required">*</span>
            </label>
            <input
              id="symbol"
              name="symbol"
              type="text"
              value={formData.symbol}
              onChange={handleChange}
              required
              placeholder="e.g., BTC, ETH, AAPL"
              maxLength={20}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="operator">
              Condition <span className="required">*</span>
            </label>
            <select
              id="operator"
              name="operator"
              value={formData.operator}
              onChange={handleChange}
            >
              <option value="ABOVE">Above</option>
              <option value="BELOW">Below</option>
              <option value="EQUALS">Equals</option>
              <option value="PERCENTAGE_CHANGE_UP">% Change Up</option>
              <option value="PERCENTAGE_CHANGE_DOWN">% Change Down</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="threshold">
              Threshold <span className="required">*</span>
            </label>
            <input
              id="threshold"
              name="threshold"
              type="number"
              step="0.01"
              value={formData.threshold}
              onChange={handleChange}
              required
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <span>Alert is active</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/alerts')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditAlert;
