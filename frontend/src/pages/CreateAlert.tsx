import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { alertsAPI, CreateAlertData, AlertType, ConditionOperator } from '../api/alerts';
import './AlertForm.css';

function CreateAlert() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateAlertData>({
    name: '',
    description: '',
    type: 'PRICE',
    symbol: '',
    operator: 'ABOVE',
    threshold: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await alertsAPI.createAlert(formData);
      navigate('/alerts');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'threshold' ? parseFloat(value) : value,
    }));
  };

  return (
    <div className="alert-form-page">
      <div className="form-header">
        <h1>Create Alert</h1>
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
          <span className="field-hint">Give your alert a descriptive name</span>
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
            <span className="field-hint">Type of metric to monitor</span>
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
            <span className="field-hint">Asset or stock symbol</span>
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
            <span className="field-hint">Trigger condition</span>
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
            <span className="field-hint">Value to trigger alert</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Alert'}
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

export default CreateAlert;
