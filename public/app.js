class AlertsApp {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    this.alerts = [];
    this.eventSource = null;
    this.isEditMode = false;
    this.isRegisterMode = false;

    this.initElements();
    this.initEventListeners();
    this.init();
  }

  initElements() {
    this.elements = {
      authSection: document.getElementById('authSection'),
      mainContent: document.getElementById('mainContent'),
      userActions: document.getElementById('userActions'),
      userInfo: document.getElementById('userInfo'),
      userName: document.getElementById('userName'),
      authTitle: document.getElementById('authTitle'),
      authForm: document.getElementById('authForm'),
      authUsername: document.getElementById('authUsername'),
      authPassword: document.getElementById('authPassword'),
      authSubmit: document.getElementById('authSubmit'),
      switchAuth: document.getElementById('switchAuth'),
      loginToggle: document.getElementById('loginToggle'),
      registerToggle: document.getElementById('registerToggle'),
      logout: document.getElementById('logout'),
      alertForm: document.getElementById('alertForm'),
      alertId: document.getElementById('alertId'),
      alertName: document.getElementById('alertName'),
      alertAsset: document.getElementById('alertAsset'),
      alertType: document.getElementById('alertType'),
      alertCondition: document.getElementById('alertCondition'),
      alertThreshold: document.getElementById('alertThreshold'),
      alertSubmit: document.getElementById('alertSubmit'),
      alertCancel: document.getElementById('alertCancel'),
      alertsList: document.getElementById('alertsList'),
      stats: document.getElementById('stats'),
      ingestionForm: document.getElementById('ingestionForm'),
      ingestAsset: document.getElementById('ingestAsset'),
      ingestPrice: document.getElementById('ingestPrice'),
      ingestVolatility: document.getElementById('ingestVolatility'),
      ingestROI: document.getElementById('ingestROI'),
      ingestionResult: document.getElementById('ingestionResult'),
      notifications: document.getElementById('notifications')
    };
  }

  initEventListeners() {
    this.elements.loginToggle.addEventListener('click', () => this.showLogin());
    this.elements.registerToggle.addEventListener('click', () => this.showRegister());
    this.elements.logout.addEventListener('click', () => this.logout());
    this.elements.switchAuth.addEventListener('click', () => this.toggleAuthMode());
    this.elements.authForm.addEventListener('submit', (e) => this.handleAuth(e));
    this.elements.alertForm.addEventListener('submit', (e) => this.handleAlertSubmit(e));
    this.elements.alertCancel.addEventListener('click', () => this.cancelEdit());
    this.elements.ingestionForm.addEventListener('submit', (e) => this.handleIngestion(e));
  }

  init() {
    if (this.token && this.user) {
      this.showMainContent();
      this.loadAlerts();
      this.loadStats();
      this.connectSSE();
    } else {
      this.showAuth();
    }
  }

  showAuth() {
    this.elements.authSection.classList.remove('hidden');
    this.elements.mainContent.classList.add('hidden');
    this.elements.userActions.classList.remove('hidden');
    this.elements.userInfo.classList.add('hidden');
  }

  showMainContent() {
    this.elements.authSection.classList.add('hidden');
    this.elements.mainContent.classList.remove('hidden');
    this.elements.userActions.classList.add('hidden');
    this.elements.userInfo.classList.remove('hidden');
    this.elements.userName.textContent = this.user.username;
  }

  showLogin() {
    this.isRegisterMode = false;
    this.elements.authTitle.textContent = 'Login';
    this.elements.authSubmit.textContent = 'Login';
    this.elements.switchAuth.textContent = 'Register';
    this.elements.switchAuth.previousElementSibling.textContent = "Don't have an account? ";
    this.elements.authSection.classList.remove('hidden');
  }

  showRegister() {
    this.isRegisterMode = true;
    this.elements.authTitle.textContent = 'Register';
    this.elements.authSubmit.textContent = 'Register';
    this.elements.switchAuth.textContent = 'Login';
    this.elements.switchAuth.previousElementSibling.textContent = "Already have an account? ";
    this.elements.authSection.classList.remove('hidden');
  }

  toggleAuthMode() {
    if (this.isRegisterMode) {
      this.showLogin();
    } else {
      this.showRegister();
    }
  }

  async handleAuth(e) {
    e.preventDefault();

    const username = this.elements.authUsername.value.trim();
    const password = this.elements.authPassword.value;

    if (!username || !password) {
      this.showNotification('Please enter username and password', 'error');
      return;
    }

    try {
      const endpoint = this.isRegisterMode ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        this.showNotification(data.error || 'Authentication failed', 'error');
        return;
      }

      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));

      this.elements.authForm.reset();
      this.showMainContent();
      this.loadAlerts();
      this.loadStats();
      this.connectSSE();
    } catch (error) {
      this.showNotification('Network error', 'error');
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.alerts = [];
    this.elements.alertsList.innerHTML = '';
    this.elements.notifications.innerHTML = '';
    this.showAuth();
  }

  async apiRequest(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      this.logout();
      throw new Error('Unauthorized');
    }

    const data = response.status === 204 ? null : await response.json();

    if (!response.ok) {
      throw new Error(data?.error || 'Request failed');
    }

    return data;
  }

  async loadAlerts() {
    try {
      this.alerts = await this.apiRequest('/api/alerts');
      this.renderAlerts();
    } catch (error) {
      this.showNotification(`Failed to load alerts: ${error.message}`, 'error');
    }
  }

  async loadStats() {
    try {
      const stats = await this.apiRequest('/api/stats');
      this.renderStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  renderStats(stats) {
    this.elements.stats.innerHTML = `
      <div class="stat-item">
        <span class="stat-value">${stats.totalAlerts}</span>
        <span class="stat-label">Total Alerts</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${stats.activeAlerts}</span>
        <span class="stat-label">Active</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${stats.recentTriggers}</span>
        <span class="stat-label">Triggers (24h)</span>
      </div>
    `;
  }

  renderAlerts() {
    if (this.alerts.length === 0) {
      this.elements.alertsList.innerHTML = `
        <div class="empty-state">
          <p>No alerts yet. Create your first alert above!</p>
        </div>
      `;
      return;
    }

    this.elements.alertsList.innerHTML = '';
    
    this.alerts.forEach(alert => {
      const template = document.getElementById('alertTemplate');
      const alertElement = template.content.cloneNode(true);
      
      const alertItem = alertElement.querySelector('.alert-item');
      alertItem.dataset.id = alert.id;

      alertElement.querySelector('.alert-name').textContent = alert.name;
      alertElement.querySelector('.alert-details').textContent = 
        `${alert.type.toUpperCase()} alert for ${alert.asset}: ${alert.condition} ${alert.threshold}`;
      
      const statusElement = alertElement.querySelector('.alert-status');
      statusElement.textContent = alert.enabled ? 'Enabled' : 'Disabled';
      statusElement.classList.add(alert.enabled ? 'enabled' : 'disabled');

      const toggleBtn = alertElement.querySelector('.toggle');
      toggleBtn.textContent = alert.enabled ? 'Disable' : 'Enable';
      toggleBtn.classList.toggle('success', !alert.enabled);
      toggleBtn.addEventListener('click', () => this.toggleAlert(alert));

      alertElement.querySelector('.edit').addEventListener('click', () => this.editAlert(alert));
      alertElement.querySelector('.delete').classList.add('danger');
      alertElement.querySelector('.delete').addEventListener('click', () => this.deleteAlert(alert));
      alertElement.querySelector('.view-history').addEventListener('click', (e) => this.toggleHistory(alert, e.target));

      this.elements.alertsList.appendChild(alertElement);
    });
  }

  async handleAlertSubmit(e) {
    e.preventDefault();

    const alertData = {
      name: this.elements.alertName.value.trim(),
      type: this.elements.alertType.value,
      asset: this.elements.alertAsset.value.trim().toUpperCase(),
      condition: this.elements.alertCondition.value,
      threshold: parseFloat(this.elements.alertThreshold.value)
    };

    if (!alertData.name || !alertData.asset || isNaN(alertData.threshold)) {
      this.showNotification('Please fill all fields correctly', 'error');
      return;
    }

    try {
      if (this.isEditMode) {
        const id = this.elements.alertId.value;
        await this.apiRequest(`/api/alerts/${id}`, {
          method: 'PUT',
          body: JSON.stringify(alertData)
        });
        this.showNotification('Alert updated successfully', 'success');
      } else {
        await this.apiRequest('/api/alerts', {
          method: 'POST',
          body: JSON.stringify(alertData)
        });
        this.showNotification('Alert created successfully', 'success');
      }

      this.elements.alertForm.reset();
      this.cancelEdit();
      this.loadAlerts();
      this.loadStats();
    } catch (error) {
      this.showNotification(`Failed to save alert: ${error.message}`, 'error');
    }
  }

  editAlert(alert) {
    this.isEditMode = true;
    this.elements.alertId.value = alert.id;
    this.elements.alertName.value = alert.name;
    this.elements.alertType.value = alert.type;
    this.elements.alertAsset.value = alert.asset;
    this.elements.alertCondition.value = alert.condition;
    this.elements.alertThreshold.value = alert.threshold;
    this.elements.alertSubmit.textContent = 'Update Alert';
    this.elements.alertCancel.classList.remove('hidden');
    
    this.elements.alertForm.scrollIntoView({ behavior: 'smooth' });
  }

  cancelEdit() {
    this.isEditMode = false;
    this.elements.alertId.value = '';
    this.elements.alertForm.reset();
    this.elements.alertSubmit.textContent = 'Create Alert';
    this.elements.alertCancel.classList.add('hidden');
  }

  async toggleAlert(alert) {
    try {
      await this.apiRequest(`/api/alerts/${alert.id}`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: !alert.enabled })
      });
      this.showNotification(`Alert ${alert.enabled ? 'disabled' : 'enabled'}`, 'success');
      this.loadAlerts();
      this.loadStats();
    } catch (error) {
      this.showNotification(`Failed to toggle alert: ${error.message}`, 'error');
    }
  }

  async deleteAlert(alert) {
    if (!confirm(`Are you sure you want to delete "${alert.name}"?`)) {
      return;
    }

    try {
      await this.apiRequest(`/api/alerts/${alert.id}`, { method: 'DELETE' });
      this.showNotification('Alert deleted successfully', 'success');
      this.loadAlerts();
      this.loadStats();
    } catch (error) {
      this.showNotification(`Failed to delete alert: ${error.message}`, 'error');
    }
  }

  async toggleHistory(alert, button) {
    const alertItem = button.closest('.alert-item');
    const historyDiv = alertItem.querySelector('.alert-history');

    if (!historyDiv.classList.contains('hidden')) {
      historyDiv.classList.add('hidden');
      button.textContent = 'History';
      return;
    }

    try {
      const history = await this.apiRequest(`/api/alerts/${alert.id}/history`);
      
      if (history.length === 0) {
        historyDiv.innerHTML = '<h4>Trigger History</h4><p>No triggers yet</p>';
      } else {
        const historyHTML = history.map(trigger => `
          <div class="history-item">
            <span class="value">Value: ${trigger.value.toFixed(2)}</span>
            <span class="timestamp"> - ${new Date(trigger.triggered_at).toLocaleString()}</span>
          </div>
        `).join('');
        
        historyDiv.innerHTML = `
          <h4>Trigger History (${history.length})</h4>
          <div class="history-list">${historyHTML}</div>
        `;
      }

      historyDiv.classList.remove('hidden');
      button.textContent = 'Hide History';
    } catch (error) {
      this.showNotification(`Failed to load history: ${error.message}`, 'error');
    }
  }

  async handleIngestion(e) {
    e.preventDefault();

    const data = {
      asset: this.elements.ingestAsset.value.trim().toUpperCase(),
      price: this.elements.ingestPrice.value ? parseFloat(this.elements.ingestPrice.value) : undefined,
      volatility: this.elements.ingestVolatility.value ? parseFloat(this.elements.ingestVolatility.value) : undefined,
      roi: this.elements.ingestROI.value ? parseFloat(this.elements.ingestROI.value) : undefined
    };

    if (!data.asset) {
      this.showNotification('Asset is required', 'error');
      return;
    }

    try {
      const result = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json());

      this.elements.ingestionResult.className = 'ingestion-result ' + (result.triggered > 0 ? 'success' : 'info');
      this.elements.ingestionResult.innerHTML = `
        <strong>Ingestion Processed</strong><br>
        Evaluated: ${result.processed} alerts<br>
        Triggered: ${result.triggered} alerts
        ${result.triggers.length > 0 ? '<br><br>Triggered alerts:<br>' + 
          result.triggers.map(t => `- ${t.alertName} (value: ${t.value})`).join('<br>') : ''}
      `;

      this.loadStats();
    } catch (error) {
      this.showNotification(`Ingestion failed: ${error.message}`, 'error');
    }
  }

  connectSSE() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const url = new URL('/api/notifications/stream', window.location.origin);
    url.searchParams.append('token', this.token);
    
    this.eventSource = new EventSource(url.toString());

    this.eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        this.handleNotification(notification);
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.eventSource.close();
      
      setTimeout(() => {
        if (this.token) {
          this.connectSSE();
        }
      }, 5000);
    };
  }

  handleNotification(notification) {
    if (notification.type === 'connected') {
      console.log('Connected to notification stream');
      return;
    }

    if (notification.type === 'alert') {
      const emptyState = this.elements.notifications.querySelector('.empty-state');
      if (emptyState) {
        emptyState.remove();
      }

      const notifElement = document.createElement('div');
      notifElement.className = 'notification alert';
      notifElement.innerHTML = `
        <h4>🔔 Alert Triggered: ${notification.alertName}</h4>
        <p><strong>Asset:</strong> ${notification.asset}</p>
        <p><strong>Type:</strong> ${notification.alertType}</p>
        <p><strong>Condition:</strong> ${notification.condition} ${notification.threshold}</p>
        <p><strong>Current Value:</strong> ${notification.value.toFixed(2)}</p>
        <p class="timestamp">${new Date(notification.triggeredAt).toLocaleString()}</p>
      `;

      this.elements.notifications.insertBefore(notifElement, this.elements.notifications.firstChild);

      const maxNotifications = 10;
      while (this.elements.notifications.children.length > maxNotifications) {
        this.elements.notifications.removeChild(this.elements.notifications.lastChild);
      }
    }
  }

  showNotification(message, type) {
    const emptyState = this.elements.notifications.querySelector('.empty-state');
    if (emptyState) {
      emptyState.remove();
    }

    const notifElement = document.createElement('div');
    notifElement.className = `notification ${type}`;
    notifElement.innerHTML = `<p>${message}</p>`;
    
    this.elements.notifications.insertBefore(notifElement, this.elements.notifications.firstChild);

    setTimeout(() => {
      notifElement.remove();
      if (this.elements.notifications.children.length === 0) {
        this.elements.notifications.innerHTML = '<p class="empty-state">No notifications yet</p>';
      }
    }, 5000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AlertsApp();
});
