/* ============================================
   RESUME MAKER â€” Client-Side Logic
   ============================================ */

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let currentResumeId = null;
let currentTemplate = 'classic';
let entryCounters = { experience: 0, education: 0, projects: 0 };
let selectedSkills = [];        // Array of skill strings (source of truth for skills picker)
let currentSkillTab = 'tech';   // Active skill category tab


// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Template Selector â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function selectTemplate(templateId) {
  currentTemplate = templateId;
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
  const card = document.querySelector(`.template-card[data-template="${templateId}"]`);
  if (card) card.classList.add('active');
  updatePreview();
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Use Template from home page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useTemplate(templateId) {
  selectTemplate(templateId);
  showPage('editor');
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SPA Page Routing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.navbar-links a').forEach(a => a.classList.remove('active'));

  const pageEl = document.getElementById(`page-${page}`);
  const navEl = document.getElementById(`nav-${page}`);
  if (pageEl) pageEl.classList.add('active');
  if (navEl) navEl.classList.add('active');

  // If switching to preview page, sync the full preview
  if (page === 'preview') {
    const fullPreview = document.getElementById('resume-paper-full');
    const content = document.getElementById('resume-content');
    if (fullPreview && content) {
      fullPreview.innerHTML = content.innerHTML;
    }
  }

  // If switching to resumes page, load the list
  if (page === 'resumes') {
    loadResumesList();
  }

  window.scrollTo(0, 0);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Mobile Tab Toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function showMobileTab(tab) {
  const editorPanel = document.getElementById('editor-panel');
  const previewPanel = document.getElementById('preview-panel');
  const buttons = document.querySelectorAll('.mobile-tab-bar button');

  buttons.forEach(b => b.classList.remove('active'));

  if (tab === 'editor') {
    editorPanel.style.display = 'block';
    previewPanel.style.display = 'none';
    buttons[0].classList.add('active');
  } else {
    editorPanel.style.display = 'none';
    previewPanel.style.display = 'flex';
    buttons[1].classList.add('active');
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Dynamic Entry Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function addEntry(type) {
  entryCounters[type]++;
  const id = entryCounters[type];
  const container = document.getElementById(`${type}-entries`);

  let html = '';

  if (type === 'experience') {
    html = `
      <div class="entry-card" id="exp-${id}">
        <div class="entry-card-header">
          <span>Experience #${id}</span>
          <button class="entry-remove" onclick="removeEntry('exp-${id}')" title="Remove">âœ•</button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Job Title</label>
            <input type="text" data-field="exp-title-${id}" placeholder="Software Engineer" oninput="updatePreview()" />
          </div>
          <div class="form-group">
            <label>Company</label>
            <input type="text" data-field="exp-company-${id}" placeholder="Google" oninput="updatePreview()" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Start Date</label>
            <input type="text" data-field="exp-start-${id}" placeholder="Jan 2022" oninput="updatePreview()" />
          </div>
          <div class="form-group">
            <label>End Date</label>
            <input type="text" data-field="exp-end-${id}" placeholder="Present" oninput="updatePreview()" />
          </div>
        </div>
        <div class="form-group">
          <label style="display:flex;align-items:center;justify-content:space-between;">Description <button class=\"btn btn-sm ss-trigger-btn\" style=\"font-size:0.72rem;padding:2px 8px;\" onclick=\"openSmartSuggest('exp-desc-'+id, document.getElementById('inp-title')?.value)\" title=\"Get wording suggestions\">✨ Suggest</button></label>
          <textarea id="exp-desc-${id}" data-field="exp-desc-${id}" rows="2" placeholder="Key responsibilities and achievements..." oninput="updatePreview()"></textarea>
        </div>
      </div>`;
  } else if (type === 'education') {
    html = `
      <div class="entry-card" id="edu-${id}">
        <div class="entry-card-header">
          <span>Education #${id}</span>
          <button class="entry-remove" onclick="removeEntry('edu-${id}')" title="Remove">âœ•</button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Degree</label>
            <input type="text" data-field="edu-degree-${id}" placeholder="B.S. Computer Science" oninput="updatePreview()" />
          </div>
          <div class="form-group">
            <label>Institution</label>
            <input type="text" data-field="edu-school-${id}" placeholder="MIT" oninput="updatePreview()" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Start Year</label>
            <input type="text" data-field="edu-start-${id}" placeholder="2018" oninput="updatePreview()" />
          </div>
          <div class="form-group">
            <label>End Year</label>
            <input type="text" data-field="edu-end-${id}" placeholder="2022" oninput="updatePreview()" />
          </div>
        </div>
        <div class="form-group">
          <label>Details (optional)</label>
          <textarea data-field="edu-desc-${id}" rows="2" placeholder="GPA, honors, relevant coursework..." oninput="updatePreview()"></textarea>
        </div>
      </div>`;
  } else if (type === 'projects') {
    html = `
      <div class="entry-card" id="proj-${id}">
        <div class="entry-card-header">
          <span>Project #${id}</span>
          <button class="entry-remove" onclick="removeEntry('proj-${id}')" title="Remove">âœ•</button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Project Name</label>
            <input type="text" data-field="proj-name-${id}" placeholder="Resume Maker" oninput="updatePreview()" />
          </div>
          <div class="form-group">
            <label>Tech Stack</label>
            <input type="text" data-field="proj-tech-${id}" placeholder="Node.js, Express, HTML/CSS" oninput="updatePreview()" />
          </div>
        </div>
        <div class="form-group">
          <label style="display:flex;align-items:center;justify-content:space-between;">Description <button class=\"btn btn-sm ss-trigger-btn\" style=\"font-size:0.72rem;padding:2px 8px;\" onclick=\"openSmartSuggest('proj-desc-'+id, document.getElementById('inp-title')?.value)\" title=\"Get wording suggestions\">✨ Suggest</button></label>
          <textarea id="proj-desc-${id}" data-field="proj-desc-${id}" rows="2" placeholder="What the project does, your role..." oninput="updatePreview()"></textarea>
        </div>
      </div>`;
  }

  container.insertAdjacentHTML('beforeend', html);
  updatePreview();
}

function removeEntry(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.style.transition = 'all 0.3s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(-20px)';
    setTimeout(() => {
      el.remove();
      updatePreview();
    }, 300);
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Collect Form Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getFormData() {
  const val = (id) => (document.getElementById(id)?.value || '').trim();
  const dataVal = (field) => {
    const el = document.querySelector(`[data-field="${field}"]`);
    return el ? el.value.trim() : '';
  };

  // Personal
  const personal = {
    fullName: val('inp-name'),
    jobTitle: val('inp-title'),
    email: val('inp-email'),
    phone: val('inp-phone'),
    location: val('inp-location'),
    website: val('inp-website')
  };

  // Summary
  const summary = val('inp-summary');

  // Experience
  const experience = [];
  document.querySelectorAll('[id^="exp-"]').forEach(card => {
    const num = card.id.split('-')[1];
    const entry = {
      title: dataVal(`exp-title-${num}`),
      company: dataVal(`exp-company-${num}`),
      startDate: dataVal(`exp-start-${num}`),
      endDate: dataVal(`exp-end-${num}`),
      description: dataVal(`exp-desc-${num}`)
    };
    if (entry.title || entry.company) experience.push(entry);
  });

  // Education
  const education = [];
  document.querySelectorAll('[id^="edu-"]').forEach(card => {
    const num = card.id.split('-')[1];
    const entry = {
      degree: dataVal(`edu-degree-${num}`),
      school: dataVal(`edu-school-${num}`),
      startDate: dataVal(`edu-start-${num}`),
      endDate: dataVal(`edu-end-${num}`),
      description: dataVal(`edu-desc-${num}`)
    };
    if (entry.degree || entry.school) education.push(entry);
  });

  // Skills â€” read from the selectedSkills picker state
  const skills = [...selectedSkills];

  // Projects
  const projects = [];
  document.querySelectorAll('[id^="proj-"]').forEach(card => {
    const num = card.id.split('-')[1];
    const entry = {
      name: dataVal(`proj-name-${num}`),
      tech: dataVal(`proj-tech-${num}`),
      description: dataVal(`proj-desc-${num}`)
    };
    if (entry.name) projects.push(entry);
  });

  return { personal, summary, experience, education, skills, projects };
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//   TEMPLATE RENDERERS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const TEMPLATES = {

  // â”€â”€â”€â”€ 1. Classic Professional (Google-style) â”€â”€â”€â”€
  classic(data) {
    let html = `<div class="tpl tpl-classic">`;

    // Header
    html += `<div class="tpl-c-header">`;
    if (data.personal.fullName) html += `<h1>${esc(data.personal.fullName)}</h1>`;
    if (data.personal.jobTitle) html += `<div class="tpl-c-subtitle">${esc(data.personal.jobTitle)}</div>`;
    html += `<div class="tpl-c-contact">`;
    if (data.personal.email) html += `<span>âœ‰ ${esc(data.personal.email)}</span>`;
    if (data.personal.phone) html += `<span>â˜Ž ${esc(data.personal.phone)}</span>`;
    if (data.personal.location) html += `<span>ðŸ“ ${esc(data.personal.location)}</span>`;
    if (data.personal.website) html += `<span>ðŸ”— ${esc(data.personal.website)}</span>`;
    html += `</div></div>`;

    // Summary
    if (data.summary) {
      html += `<div class="tpl-c-section"><div class="tpl-c-section-title">Professional Summary</div><p>${esc(data.summary)}</p></div>`;
    }

    // Education (first for B.Tech freshers)
    if (data.education.length) {
      html += `<div class="tpl-c-section"><div class="tpl-c-section-title">Education</div>`;
      data.education.forEach(e => {
        html += `<div class="tpl-c-entry"><div class="tpl-c-entry-row"><h4>${esc(e.degree)}</h4><span class="tpl-c-date">${esc(e.startDate)}${e.endDate ? ' â€” ' + esc(e.endDate) : ''}</span></div>`;
        if (e.school) html += `<div class="tpl-c-org">${esc(e.school)}</div>`;
        if (e.description) html += `<p>${esc(e.description)}</p>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Experience
    if (data.experience.length) {
      html += `<div class="tpl-c-section"><div class="tpl-c-section-title">Experience</div>`;
      data.experience.forEach(e => {
        html += `<div class="tpl-c-entry"><div class="tpl-c-entry-row"><h4>${esc(e.title)}</h4><span class="tpl-c-date">${esc(e.startDate)}${e.endDate ? ' â€” ' + esc(e.endDate) : ''}</span></div>`;
        if (e.company) html += `<div class="tpl-c-org">${esc(e.company)}</div>`;
        if (e.description) html += `<p>${esc(e.description)}</p>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Projects
    if (data.projects.length) {
      html += `<div class="tpl-c-section"><div class="tpl-c-section-title">Projects</div>`;
      data.projects.forEach(p => {
        html += `<div class="tpl-c-entry"><div class="tpl-c-entry-row"><h4>${esc(p.name)}</h4>${p.tech ? `<span class="tpl-c-date">${esc(p.tech)}</span>` : ''}</div>`;
        if (p.description) html += `<p>${esc(p.description)}</p>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Skills
    if (data.skills.length) {
      html += `<div class="tpl-c-section"><div class="tpl-c-section-title">Skills</div><div class="tpl-c-skills">`;
      data.skills.forEach(s => { html += `<span class="tpl-c-skill">${esc(s)}</span>`; });
      html += `</div></div>`;
    }

    html += `</div>`;
    return html;
  },

  // â”€â”€â”€â”€ 2. Modern Sidebar (LinkedIn-style) â”€â”€â”€â”€
  sidebar(data) {
    let sidebarHtml = '';
    let mainHtml = '';

    // Sidebar: Contact
    sidebarHtml += `<div class="tpl-s-profile">`;
    if (data.personal.fullName) sidebarHtml += `<h1>${esc(data.personal.fullName)}</h1>`;
    if (data.personal.jobTitle) sidebarHtml += `<div class="tpl-s-jobtitle">${esc(data.personal.jobTitle)}</div>`;
    sidebarHtml += `</div>`;

    sidebarHtml += `<div class="tpl-s-sidebar-section"><div class="tpl-s-sidebar-title">Contact</div>`;
    if (data.personal.email) sidebarHtml += `<div class="tpl-s-contact-item">âœ‰ ${esc(data.personal.email)}</div>`;
    if (data.personal.phone) sidebarHtml += `<div class="tpl-s-contact-item">â˜Ž ${esc(data.personal.phone)}</div>`;
    if (data.personal.location) sidebarHtml += `<div class="tpl-s-contact-item">ðŸ“ ${esc(data.personal.location)}</div>`;
    if (data.personal.website) sidebarHtml += `<div class="tpl-s-contact-item">ðŸ”— ${esc(data.personal.website)}</div>`;
    sidebarHtml += `</div>`;

    // Sidebar: Skills
    if (data.skills.length) {
      sidebarHtml += `<div class="tpl-s-sidebar-section"><div class="tpl-s-sidebar-title">Skills</div>`;
      data.skills.forEach(s => { sidebarHtml += `<div class="tpl-s-skill">${esc(s)}</div>`; });
      sidebarHtml += `</div>`;
    }

    // Sidebar: Education
    if (data.education.length) {
      sidebarHtml += `<div class="tpl-s-sidebar-section"><div class="tpl-s-sidebar-title">Education</div>`;
      data.education.forEach(e => {
        sidebarHtml += `<div class="tpl-s-edu-item">`;
        if (e.degree) sidebarHtml += `<div class="tpl-s-edu-degree">${esc(e.degree)}</div>`;
        if (e.school) sidebarHtml += `<div class="tpl-s-edu-school">${esc(e.school)}</div>`;
        sidebarHtml += `<div class="tpl-s-edu-date">${esc(e.startDate)}${e.endDate ? ' â€” ' + esc(e.endDate) : ''}</div>`;
        if (e.description) sidebarHtml += `<div class="tpl-s-edu-desc">${esc(e.description)}</div>`;
        sidebarHtml += `</div>`;
      });
      sidebarHtml += `</div>`;
    }

    // Main: Summary
    if (data.summary) {
      mainHtml += `<div class="tpl-s-main-section"><div class="tpl-s-main-title">About Me</div><p>${esc(data.summary)}</p></div>`;
    }

    // Main: Experience
    if (data.experience.length) {
      mainHtml += `<div class="tpl-s-main-section"><div class="tpl-s-main-title">Experience</div>`;
      data.experience.forEach(e => {
        mainHtml += `<div class="tpl-s-entry"><div class="tpl-s-entry-row"><h4>${esc(e.title)}</h4><span class="tpl-s-date">${esc(e.startDate)}${e.endDate ? ' â€” ' + esc(e.endDate) : ''}</span></div>`;
        if (e.company) mainHtml += `<div class="tpl-s-company">${esc(e.company)}</div>`;
        if (e.description) mainHtml += `<p>${esc(e.description)}</p>`;
        mainHtml += `</div>`;
      });
      mainHtml += `</div>`;
    }

    // Main: Projects
    if (data.projects.length) {
      mainHtml += `<div class="tpl-s-main-section"><div class="tpl-s-main-title">Projects</div>`;
      data.projects.forEach(p => {
        mainHtml += `<div class="tpl-s-entry"><div class="tpl-s-entry-row"><h4>${esc(p.name)}</h4>${p.tech ? `<span class="tpl-s-date">${esc(p.tech)}</span>` : ''}</div>`;
        if (p.description) mainHtml += `<p>${esc(p.description)}</p>`;
        mainHtml += `</div>`;
      });
      mainHtml += `</div>`;
    }

    return `<div class="tpl tpl-sidebar"><div class="tpl-s-left">${sidebarHtml}</div><div class="tpl-s-right">${mainHtml}</div></div>`;
  },

  // â”€â”€â”€â”€ 3. Tech Minimalist (Pragmatic Engineer-style) â”€â”€â”€â”€
  minimal(data) {
    let html = `<div class="tpl tpl-minimal">`;

    // Header
    html += `<div class="tpl-m-header">`;
    if (data.personal.fullName) html += `<h1>${esc(data.personal.fullName)}</h1>`;
    html += `<div class="tpl-m-contact">`;
    const contactParts = [];
    if (data.personal.email) contactParts.push(esc(data.personal.email));
    if (data.personal.phone) contactParts.push(esc(data.personal.phone));
    if (data.personal.location) contactParts.push(esc(data.personal.location));
    if (data.personal.website) contactParts.push(esc(data.personal.website));
    html += contactParts.join(' Â· ');
    html += `</div>`;
    if (data.personal.jobTitle) html += `<div class="tpl-m-jobtitle">${esc(data.personal.jobTitle)}</div>`;
    html += `</div>`;

    // Summary
    if (data.summary) {
      html += `<div class="tpl-m-section"><div class="tpl-m-title">SUMMARY</div><p>${esc(data.summary)}</p></div>`;
    }

    // Skills (as inline list for dev resumes)
    if (data.skills.length) {
      html += `<div class="tpl-m-section"><div class="tpl-m-title">TECHNICAL SKILLS</div><p class="tpl-m-skills-list">${data.skills.map(s => esc(s)).join(' Â· ')}</p></div>`;
    }

    // Experience
    if (data.experience.length) {
      html += `<div class="tpl-m-section"><div class="tpl-m-title">EXPERIENCE</div>`;
      data.experience.forEach(e => {
        html += `<div class="tpl-m-entry"><div class="tpl-m-entry-row"><strong>${esc(e.title)}</strong><span>${esc(e.startDate)}${e.endDate ? ' â€“ ' + esc(e.endDate) : ''}</span></div>`;
        if (e.company) html += `<div class="tpl-m-company">${esc(e.company)}</div>`;
        if (e.description) html += `<p>${esc(e.description)}</p>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Projects
    if (data.projects.length) {
      html += `<div class="tpl-m-section"><div class="tpl-m-title">PROJECTS</div>`;
      data.projects.forEach(p => {
        html += `<div class="tpl-m-entry"><div class="tpl-m-entry-row"><strong>${esc(p.name)}</strong>${p.tech ? `<span>${esc(p.tech)}</span>` : ''}</div>`;
        if (p.description) html += `<p>${esc(p.description)}</p>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Education
    if (data.education.length) {
      html += `<div class="tpl-m-section"><div class="tpl-m-title">EDUCATION</div>`;
      data.education.forEach(e => {
        html += `<div class="tpl-m-entry"><div class="tpl-m-entry-row"><strong>${esc(e.degree)}</strong><span>${esc(e.startDate)}${e.endDate ? ' â€“ ' + esc(e.endDate) : ''}</span></div>`;
        if (e.school) html += `<div class="tpl-m-company">${esc(e.school)}</div>`;
        if (e.description) html += `<p>${esc(e.description)}</p>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    html += `</div>`;
    return html;
  },

  // â”€â”€â”€â”€ 4. Bold Header (Amazon-style) â”€â”€â”€â”€
  bold(data) {
    let html = `<div class="tpl tpl-bold">`;

    // Dark header banner
    html += `<div class="tpl-b-header">`;
    if (data.personal.fullName) html += `<h1>${esc(data.personal.fullName)}</h1>`;
    if (data.personal.jobTitle) html += `<div class="tpl-b-jobtitle">${esc(data.personal.jobTitle)}</div>`;
    html += `<div class="tpl-b-contact">`;
    if (data.personal.email) html += `<span>${esc(data.personal.email)}</span>`;
    if (data.personal.phone) html += `<span>${esc(data.personal.phone)}</span>`;
    if (data.personal.location) html += `<span>${esc(data.personal.location)}</span>`;
    if (data.personal.website) html += `<span>${esc(data.personal.website)}</span>`;
    html += `</div></div>`;

    // Body
    html += `<div class="tpl-b-body">`;

    // Summary
    if (data.summary) {
      html += `<div class="tpl-b-section"><h3 class="tpl-b-title">PROFESSIONAL SUMMARY</h3><p>${esc(data.summary)}</p></div>`;
    }

    // Experience
    if (data.experience.length) {
      html += `<div class="tpl-b-section"><h3 class="tpl-b-title">EXPERIENCE</h3>`;
      data.experience.forEach(e => {
        html += `<div class="tpl-b-entry"><div class="tpl-b-entry-top"><div><h4>${esc(e.title)}</h4>`;
        if (e.company) html += `<div class="tpl-b-company">${esc(e.company)}</div>`;
        html += `</div><div class="tpl-b-date">${esc(e.startDate)}${e.endDate ? ' â€” ' + esc(e.endDate) : ''}</div></div>`;
        if (e.description) html += `<p>${esc(e.description)}</p>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Projects
    if (data.projects.length) {
      html += `<div class="tpl-b-section"><h3 class="tpl-b-title">KEY PROJECTS</h3>`;
      data.projects.forEach(p => {
        html += `<div class="tpl-b-entry"><div class="tpl-b-entry-top"><h4>${esc(p.name)}</h4>${p.tech ? `<div class="tpl-b-date">${esc(p.tech)}</div>` : ''}</div>`;
        if (p.description) html += `<p>${esc(p.description)}</p>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Education
    if (data.education.length) {
      html += `<div class="tpl-b-section"><h3 class="tpl-b-title">EDUCATION</h3>`;
      data.education.forEach(e => {
        html += `<div class="tpl-b-entry"><div class="tpl-b-entry-top"><div><h4>${esc(e.degree)}</h4>`;
        if (e.school) html += `<div class="tpl-b-company">${esc(e.school)}</div>`;
        html += `</div><div class="tpl-b-date">${esc(e.startDate)}${e.endDate ? ' â€” ' + esc(e.endDate) : ''}</div></div>`;
        if (e.description) html += `<p>${esc(e.description)}</p>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Skills
    if (data.skills.length) {
      html += `<div class="tpl-b-section"><h3 class="tpl-b-title">TECHNICAL SKILLS</h3><div class="tpl-b-skills">`;
      data.skills.forEach(s => { html += `<span class="tpl-b-skill">${esc(s)}</span>`; });
      html += `</div></div>`;
    }

    html += `</div></div>`;
    return html;
  },

  // â”€â”€â”€â”€ 5. Elegant Accent (Microsoft-style) â”€â”€â”€â”€
  elegant(data) {
    let html = `<div class="tpl tpl-elegant">`;

    // Header with accent line
    html += `<div class="tpl-e-header">`;
    html += `<div class="tpl-e-accent-bar"></div>`;
    if (data.personal.fullName) html += `<h1>${esc(data.personal.fullName)}</h1>`;
    if (data.personal.jobTitle) html += `<div class="tpl-e-jobtitle">${esc(data.personal.jobTitle)}</div>`;
    html += `<div class="tpl-e-contact">`;
    if (data.personal.email) html += `<span>${esc(data.personal.email)}</span>`;
    if (data.personal.phone) html += `<span>${esc(data.personal.phone)}</span>`;
    if (data.personal.location) html += `<span>${esc(data.personal.location)}</span>`;
    if (data.personal.website) html += `<span>${esc(data.personal.website)}</span>`;
    html += `</div></div>`;

    // Summary
    if (data.summary) {
      html += `<div class="tpl-e-section"><h3 class="tpl-e-title">Profile</h3><p class="tpl-e-summary">${esc(data.summary)}</p></div>`;
    }

    // Experience
    if (data.experience.length) {
      html += `<div class="tpl-e-section"><h3 class="tpl-e-title">Professional Experience</h3>`;
      data.experience.forEach(e => {
        html += `<div class="tpl-e-entry"><div class="tpl-e-entry-row"><h4>${esc(e.title)}</h4><span class="tpl-e-date">${esc(e.startDate)}${e.endDate ? ' â€” ' + esc(e.endDate) : ''}</span></div>`;
        if (e.company) html += `<div class="tpl-e-company">${esc(e.company)}</div>`;
        if (e.description) html += `<p>${esc(e.description)}</p>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Education
    if (data.education.length) {
      html += `<div class="tpl-e-section"><h3 class="tpl-e-title">Education</h3>`;
      data.education.forEach(e => {
        html += `<div class="tpl-e-entry"><div class="tpl-e-entry-row"><h4>${esc(e.degree)}</h4><span class="tpl-e-date">${esc(e.startDate)}${e.endDate ? ' â€” ' + esc(e.endDate) : ''}</span></div>`;
        if (e.school) html += `<div class="tpl-e-company">${esc(e.school)}</div>`;
        if (e.description) html += `<p>${esc(e.description)}</p>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Projects
    if (data.projects.length) {
      html += `<div class="tpl-e-section"><h3 class="tpl-e-title">Projects</h3>`;
      data.projects.forEach(p => {
        html += `<div class="tpl-e-entry"><div class="tpl-e-entry-row"><h4>${esc(p.name)}</h4>${p.tech ? `<span class="tpl-e-date">${esc(p.tech)}</span>` : ''}</div>`;
        if (p.description) html += `<p>${esc(p.description)}</p>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Skills
    if (data.skills.length) {
      html += `<div class="tpl-e-section"><h3 class="tpl-e-title">Skills & Expertise</h3><div class="tpl-e-skills">`;
      data.skills.forEach(s => { html += `<span class="tpl-e-skill">${esc(s)}</span>`; });
      html += `</div></div>`;
    }

    html += `</div>`;
    return html;
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Live Preview Rendering â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function updatePreview() {
  const data = getFormData();
  const content = document.getElementById('resume-content');
  const empty = document.getElementById('preview-empty');

  const hasData = data.personal.fullName || data.personal.jobTitle || data.summary ||
    data.experience.length || data.education.length || data.skills.length || data.projects.length;

  if (!hasData) {
    content.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  content.style.display = 'block';
  empty.style.display = 'none';

  // Render with selected template
  const renderer = TEMPLATES[currentTemplate] || TEMPLATES.classic;
  content.innerHTML = renderer(data);
}

// ──────────── ATS Add Keyword to Resume ────────────
function atsAddKeywordToResume(keyword) {
  addSkill(keyword);
  showPage('editor');
  showToast(`"${keyword}" added to your skills!`);
}

// HTML escape helper
function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Save Resume (API) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function saveResume() {
  const data = getFormData();

  if (!data.personal.fullName) {
    showToast('Please enter at least your full name before saving.', 'warning');
    return;
  }

  // Include template selection in saved data
  data.template = currentTemplate;

  try {
    let response;
    if (currentResumeId) {
      // Update existing
      response = await fetch(`/api/resumes/${currentResumeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      // Create new
      response = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }

    if (!response.ok) throw new Error('Server error');

    const saved = await response.json();
    currentResumeId = saved.id;
    showToast(`Resume "${data.personal.fullName}" saved successfully!`);
  } catch (err) {
    console.error('Save failed:', err);
    showToast('Failed to save resume. Is the server running?', 'error');
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Load Resumes List (API) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadResumesList() {
  const container = document.getElementById('resumes-list');
  const emptyEl = document.getElementById('resumes-empty');

  try {
    const response = await fetch('/api/resumes');
    if (!response.ok) throw new Error('Server error');

    const resumes = await response.json();

    if (resumes.length === 0) {
      container.innerHTML = '';
      container.appendChild(emptyEl);
      emptyEl.style.display = 'block';
      return;
    }

    emptyEl.style.display = 'none';
    container.innerHTML = resumes.map(r => `
      <div class="feature-card" style="cursor:pointer;" onclick="loadResume('${r.id}')">
        <h3 style="margin-bottom:4px;">${esc(r.name || 'Untitled')}</h3>
        ${r.title ? `<p style="color:var(--accent-text);font-size:0.85rem;margin-bottom:8px;">${esc(r.title)}</p>` : ''}
        <p style="font-size:0.8rem;color:var(--text-muted);">Updated: ${new Date(r.updatedAt).toLocaleDateString()}</p>
        <div style="margin-top:12px;display:flex;gap:8px;">
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();loadResume('${r.id}')">âœï¸ Edit</button>
          <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteResume('${r.id}')">ðŸ—‘ï¸ Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load resumes:', err);
    container.innerHTML = `<div class="empty-state"><div class="icon">âš ï¸</div><p>Could not connect to server. Make sure the Node.js server is running.</p></div>`;
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Load a Single Resume (API) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadResume(id) {
  try {
    const response = await fetch(`/api/resumes/${id}`);
    if (!response.ok) throw new Error('Not found');

    const data = await response.json();
    currentResumeId = data.id;

    // Restore template selection
    if (data.template && TEMPLATES[data.template]) {
      selectTemplate(data.template);
    }

    // Populate personal info
    document.getElementById('inp-name').value = data.personal?.fullName || '';
    document.getElementById('inp-title').value = data.personal?.jobTitle || '';
    document.getElementById('inp-email').value = data.personal?.email || '';
    document.getElementById('inp-phone').value = data.personal?.phone || '';
    document.getElementById('inp-location').value = data.personal?.location || '';
    document.getElementById('inp-website').value = data.personal?.website || '';

    // Summary
    document.getElementById('inp-summary').value = data.summary || '';
    updateSummaryWordCount(); // Update word count on load

    // Skills â€” restore into the picker
    setSelectedSkills(data.skills || []);

    // Clear existing entries
    document.getElementById('experience-entries').innerHTML = '';
    document.getElementById('education-entries').innerHTML = '';
    document.getElementById('projects-entries').innerHTML = '';
    entryCounters = { experience: 0, education: 0, projects: 0 };

    // Re-create experience entries
    (data.experience || []).forEach(e => {
      addEntry('experience');
      const num = entryCounters.experience;
      setDataField(`exp-title-${num}`, e.title);
      setDataField(`exp-company-${num}`, e.company);
      setDataField(`exp-start-${num}`, e.startDate);
      setDataField(`exp-end-${num}`, e.endDate);
      setDataField(`exp-desc-${num}`, e.description);
    });

    // Re-create education entries
    (data.education || []).forEach(e => {
      addEntry('education');
      const num = entryCounters.education;
      setDataField(`edu-degree-${num}`, e.degree);
      setDataField(`edu-school-${num}`, e.school);
      setDataField(`edu-start-${num}`, e.startDate);
      setDataField(`edu-end-${num}`, e.endDate);
      setDataField(`edu-desc-${num}`, e.description);
    });

    // Re-create projects entries
    (data.projects || []).forEach(p => {
      addEntry('projects');
      const num = entryCounters.projects;
      setDataField(`proj-name-${num}`, p.name);
      setDataField(`proj-tech-${num}`, p.tech);
      setDataField(`proj-desc-${num}`, p.description);
    });

    updatePreview();
    showPage('editor');
    showToast(`Loaded resume: ${data.personal?.fullName || 'Untitled'}`);
  } catch (err) {
    console.error('Load failed:', err);
    showToast('Failed to load resume.', 'error');
  }
}

function setDataField(field, value) {
  const el = document.querySelector(`[data-field="${field}"]`);
  if (el) el.value = value || '';
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Delete Resume (API) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function deleteResume(id) {
  if (!confirm('Are you sure you want to delete this resume?')) return;

  try {
    const response = await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Delete failed');

    if (currentResumeId === id) currentResumeId = null;
    showToast('Resume deleted.');
    loadResumesList();
  } catch (err) {
    console.error('Delete failed:', err);
    showToast('Failed to delete resume.', 'error');
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ PDF Download â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function downloadPDF() {
  const resumeContent = document.getElementById('resume-content');
  if (!resumeContent || resumeContent.style.display === 'none') {
    showToast('Nothing to download â€” fill in your resume first!', 'warning');
    return;
  }

  // Clone content into a temporary container for clean PDF
  const clone = document.createElement('div');
  clone.innerHTML = resumeContent.innerHTML;
  clone.style.cssText = `
    background: #fff; color: #1a1a2e; font-family: 'Inter', sans-serif;
    padding: 0; max-width: 700px; line-height: 1.5;
  `;

  // Gather all stylesheets for PDF rendering
  const style = document.createElement('style');
  style.textContent = getPDFStyles();
  clone.prepend(style);

  const name = document.getElementById('inp-name')?.value?.trim() || 'resume';
  const filename = `${name.replace(/\s+/g, '_')}_resume.pdf`;

  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(clone).save();
  showToast('Downloading PDF...');
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ PDF Style Strings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getPDFStyles() {
  return `
    /* Shared */
    .tpl { font-family: 'Inter', sans-serif; font-size: 13px; color: #1a1a2e; line-height: 1.5; }
    .tpl h1 { margin: 0; } .tpl h3 { margin: 0; } .tpl h4 { margin: 0; } .tpl p { margin: 4px 0 0; }

    /* Classic */
    .tpl-classic { padding: 40px; }
    .tpl-c-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #2563eb; }
    .tpl-c-header h1 { font-size: 24px; font-weight: 800; color: #1e293b; }
    .tpl-c-subtitle { color: #2563eb; font-weight: 600; margin: 4px 0 10px; }
    .tpl-c-contact { display: flex; justify-content: center; flex-wrap: wrap; gap: 14px; font-size: 12px; color: #64748b; }
    .tpl-c-section { margin-bottom: 20px; }
    .tpl-c-section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #2563eb; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; margin-bottom: 10px; }
    .tpl-c-entry { margin-bottom: 14px; }
    .tpl-c-entry-row { display: flex; justify-content: space-between; align-items: baseline; }
    .tpl-c-entry-row h4 { font-size: 14px; font-weight: 700; color: #1e293b; }
    .tpl-c-date { font-size: 11px; color: #94a3b8; }
    .tpl-c-org { font-size: 12px; color: #2563eb; font-weight: 600; }
    .tpl-c-entry p { font-size: 12px; color: #475569; }
    .tpl-c-skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .tpl-c-skill { padding: 3px 10px; background: #eff6ff; color: #2563eb; border-radius: 50px; font-size: 11px; font-weight: 600; }

    /* Sidebar */
    .tpl-sidebar { display: flex; min-height: 100%; }
    .tpl-s-left { width: 35%; background: #1e293b; color: #e2e8f0; padding: 32px 20px; }
    .tpl-s-right { width: 65%; padding: 32px 24px; }
    .tpl-s-profile h1 { font-size: 20px; color: #fff; font-weight: 800; }
    .tpl-s-jobtitle { color: #38bdf8; font-size: 12px; font-weight: 600; margin: 4px 0 20px; }
    .tpl-s-sidebar-section { margin-bottom: 20px; }
    .tpl-s-sidebar-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #38bdf8; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .tpl-s-contact-item { font-size: 11px; margin-bottom: 6px; color: #cbd5e1; word-break: break-all; }
    .tpl-s-skill { font-size: 11px; background: rgba(56,189,248,0.15); color: #7dd3fc; padding: 3px 10px; border-radius: 4px; margin-bottom: 4px; display: inline-block; margin-right: 4px; }
    .tpl-s-edu-item { margin-bottom: 12px; }
    .tpl-s-edu-degree { font-size: 12px; font-weight: 700; color: #fff; }
    .tpl-s-edu-school { font-size: 11px; color: #38bdf8; }
    .tpl-s-edu-date { font-size: 10px; color: #94a3b8; }
    .tpl-s-edu-desc { font-size: 10px; color: #94a3b8; margin-top: 2px; }
    .tpl-s-main-section { margin-bottom: 20px; }
    .tpl-s-main-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1e293b; padding-bottom: 4px; border-bottom: 2px solid #38bdf8; margin-bottom: 10px; }
    .tpl-s-entry { margin-bottom: 14px; }
    .tpl-s-entry-row { display: flex; justify-content: space-between; align-items: baseline; }
    .tpl-s-entry-row h4 { font-size: 13px; font-weight: 700; color: #1e293b; }
    .tpl-s-date { font-size: 11px; color: #94a3b8; }
    .tpl-s-company { font-size: 12px; color: #0ea5e9; font-weight: 600; }
    .tpl-s-entry p, .tpl-s-main-section > p { font-size: 12px; color: #475569; }

    /* Minimal */
    .tpl-minimal { padding: 40px; }
    .tpl-m-header { margin-bottom: 20px; border-bottom: 2px solid #1a1a2e; padding-bottom: 12px; }
    .tpl-m-header h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .tpl-m-contact { font-size: 11px; color: #64748b; margin-top: 4px; font-family: 'Courier New', monospace; }
    .tpl-m-jobtitle { font-size: 13px; color: #475569; margin-top: 4px; }
    .tpl-m-section { margin-bottom: 18px; }
    .tpl-m-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #1a1a2e; padding-bottom: 4px; border-bottom: 1px solid #cbd5e1; margin-bottom: 8px; font-family: 'Courier New', monospace; }
    .tpl-m-entry { margin-bottom: 12px; }
    .tpl-m-entry-row { display: flex; justify-content: space-between; align-items: baseline; }
    .tpl-m-entry-row strong { font-size: 13px; color: #1e293b; }
    .tpl-m-entry-row span { font-size: 11px; color: #94a3b8; font-family: 'Courier New', monospace; }
    .tpl-m-company { font-size: 12px; color: #64748b; font-weight: 500; }
    .tpl-m-entry p, .tpl-m-section > p { font-size: 12px; color: #475569; }
    .tpl-m-skills-list { font-family: 'Courier New', monospace; font-size: 12px; color: #334155; }

    /* Bold */
    .tpl-bold { overflow: hidden; }
    .tpl-b-header { background: #0f172a; color: #fff; padding: 32px 36px; }
    .tpl-b-header h1 { font-size: 28px; font-weight: 900; letter-spacing: -1px; }
    .tpl-b-jobtitle { color: #f59e0b; font-size: 14px; font-weight: 700; margin: 4px 0 12px; text-transform: uppercase; letter-spacing: 1px; }
    .tpl-b-contact { display: flex; flex-wrap: wrap; gap: 14px; font-size: 11px; color: #94a3b8; }
    .tpl-b-body { padding: 28px 36px; }
    .tpl-b-section { margin-bottom: 22px; }
    .tpl-b-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #0f172a; padding-bottom: 6px; border-bottom: 3px solid #f59e0b; margin-bottom: 12px; }
    .tpl-b-entry { margin-bottom: 16px; }
    .tpl-b-entry-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .tpl-b-entry-top h4 { font-size: 14px; font-weight: 700; color: #0f172a; }
    .tpl-b-company { font-size: 12px; color: #f59e0b; font-weight: 700; }
    .tpl-b-date { font-size: 11px; color: #64748b; white-space: nowrap; }
    .tpl-b-entry p { font-size: 12px; color: #475569; margin-top: 4px; }
    .tpl-b-skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .tpl-b-skill { padding: 4px 12px; background: #fef3c7; color: #92400e; border-radius: 4px; font-size: 11px; font-weight: 700; }

    /* Elegant */
    .tpl-elegant { padding: 40px; }
    .tpl-e-header { margin-bottom: 24px; }
    .tpl-e-accent-bar { width: 60px; height: 4px; background: linear-gradient(90deg, #7c3aed, #a78bfa); border-radius: 2px; margin-bottom: 16px; }
    .tpl-e-header h1 { font-size: 26px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
    .tpl-e-jobtitle { color: #7c3aed; font-size: 13px; font-weight: 600; margin: 4px 0 12px; }
    .tpl-e-contact { display: flex; flex-wrap: wrap; gap: 16px; font-size: 11px; color: #64748b; padding-top: 10px; border-top: 1px solid #e2e8f0; }
    .tpl-e-section { margin-bottom: 22px; }
    .tpl-e-title { font-size: 13px; font-weight: 700; color: #7c3aed; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #ede9fe; }
    .tpl-e-entry { margin-bottom: 14px; }
    .tpl-e-entry-row { display: flex; justify-content: space-between; align-items: baseline; }
    .tpl-e-entry-row h4 { font-size: 14px; font-weight: 700; color: #1e293b; }
    .tpl-e-date { font-size: 11px; color: #94a3b8; }
    .tpl-e-company { font-size: 12px; color: #7c3aed; font-weight: 600; }
    .tpl-e-entry p, .tpl-e-summary { font-size: 12px; color: #475569; line-height: 1.7; }
    .tpl-e-skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .tpl-e-skill { padding: 3px 10px; background: #f5f3ff; color: #7c3aed; border-radius: 50px; font-size: 11px; font-weight: 600; border: 1px solid #ede9fe; }
  `;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Clear Editor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function clearEditor() {
  if (!confirm('Clear all fields? This cannot be undone.')) return;

  currentResumeId = null;
  document.querySelectorAll('#page-editor input:not([type=hidden]), #page-editor textarea').forEach(el => el.value = '');
  document.getElementById('experience-entries').innerHTML = '';
  document.getElementById('education-entries').innerHTML = '';
  document.getElementById('projects-entries').innerHTML = '';
  entryCounters = { experience: 0, education: 0, projects: 0 };
  setSelectedSkills([]);
  selectTemplate('classic');
  updatePreview();
  showToast('Editor cleared.');
}

// ──────────── Summary Word Count ────────────
function updateSummaryWordCount() {
  const textarea = document.getElementById('inp-summary');
  const counter = document.getElementById('summary-wordcount');
  if (!textarea || !counter) return;
  const text = textarea.value.trim();
  const count = text.length === 0 ? 0 : text.split(/\s+/).length;
  counter.textContent = `${count} word${count === 1 ? '' : 's'}`;
  counter.style.color = count > 80 ? '#f87171' : '';
}

// ──────────── Export / Import Resume JSON ────────────
function exportResumeJSON() {
  const data = getFormData();
  const name = (data.personal?.fullName || 'resume').replace(/\s+/g, '_');
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}_resume.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Resume exported as JSON!');
}

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      importResumeJSON(data);
    } catch {
      showToast('Invalid JSON file.', 'error');
    }
  };
  reader.readAsText(file);
  // Reset so same file can be re-imported
  event.target.value = '';
}

function importResumeJSON(data) {
  if (!data || typeof data !== 'object') { showToast('Invalid resume data.', 'error'); return; }

  currentResumeId = null; // treat as new, unsaved

  // Personal info
  document.getElementById('inp-name').value = data.personal?.fullName || '';
  document.getElementById('inp-title').value = data.personal?.jobTitle || '';
  document.getElementById('inp-email').value = data.personal?.email || '';
  document.getElementById('inp-phone').value = data.personal?.phone || '';
  document.getElementById('inp-location').value = data.personal?.location || '';
  document.getElementById('inp-website').value = data.personal?.website || '';

  // Summary
  document.getElementById('inp-summary').value = data.summary || '';
  updateSummaryWordCount();

  // Skills
  setSelectedSkills(data.skills || []);

  // Dynamic entries
  document.getElementById('experience-entries').innerHTML = '';
  document.getElementById('education-entries').innerHTML = '';
  document.getElementById('projects-entries').innerHTML = '';
  entryCounters = { experience: 0, education: 0, projects: 0 };

  (data.experience || []).forEach(exp => {
    addEntry('experience');
    const n = entryCounters.experience;
    setDataField(`exp-title-${n}`, exp.title);
    setDataField(`exp-company-${n}`, exp.company);
    setDataField(`exp-start-${n}`, exp.startDate);
    setDataField(`exp-end-${n}`, exp.endDate);
    setDataField(`exp-desc-${n}`, exp.description);
  });
  (data.education || []).forEach(edu => {
    addEntry('education');
    const n = entryCounters.education;
    setDataField(`edu-degree-${n}`, edu.degree);
    setDataField(`edu-school-${n}`, edu.school);
    setDataField(`edu-start-${n}`, edu.startDate);
    setDataField(`edu-end-${n}`, edu.endDate);
    setDataField(`edu-desc-${n}`, edu.description);
  });
  (data.projects || []).forEach(proj => {
    addEntry('projects');
    const n = entryCounters.projects;
    setDataField(`proj-name-${n}`, proj.name);
    setDataField(`proj-tech-${n}`, proj.tech);
    setDataField(`proj-desc-${n}`, proj.description);
  });

  if (data.template) selectTemplate(data.template);
  updatePreview();
  showPage('editor');
  showToast(`Imported: ${data.personal?.fullName || 'Resume'}`);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Toast Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function showToast(message, type = 'success') {
  // Remove any existing toast
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'toast';

  if (type === 'error') {
    toast.style.background = 'rgba(239, 68, 68, 0.15)';
    toast.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    toast.style.color = '#f87171';
  } else if (type === 'warning') {
    toast.style.background = 'rgba(234, 179, 8, 0.15)';
    toast.style.borderColor = 'rgba(234, 179, 8, 0.3)';
    toast.style.color = '#fbbf24';
  }

  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// ──────────── Initialize ────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSearchSuggestions('');
  updatePreview();
  updateSummaryWordCount();

  // Listen for changes in the summary textarea to update word count
  const summaryTextarea = document.getElementById('inp-summary');
  if (summaryTextarea) {
    summaryTextarea.addEventListener('input', updateSummaryWordCount);
  }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//   SKILLS PICKER ENGINE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Skill library â€” 5 categories with curated options
const SKILL_LIBRARY = {
  tech: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Kotlin', 'Swift',
    'HTML', 'CSS', 'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Django',
    'Flask', 'Spring Boot', 'REST APIs', 'GraphQL', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB',
    'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD', 'Git', 'Linux',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Structures', 'Algorithms', 'System Design'
  ],
  soft: [
    'Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Critical Thinking',
    'Time Management', 'Adaptability', 'Creativity', 'Attention to Detail', 'Work Ethic',
    'Conflict Resolution', 'Mentoring', 'Public Speaking', 'Decision Making', 'Empathy',
    'Project Management', 'Collaboration', 'Analytical Thinking', 'Fast Learner', 'Self-Motivated'
  ],
  lang: [
    'English', 'Hindi', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Arabic',
    'Portuguese', 'Russian', 'Korean', 'Italian', 'Dutch', 'Bengali', 'Tamil', 'Telugu'
  ],
  tools: [
    'VS Code', 'IntelliJ IDEA', 'GitHub', 'GitLab', 'Jira', 'Confluence', 'Postman',
    'Figma', 'Notion', 'Slack', 'Webpack', 'Vite', 'npm', 'Yarn', 'Bash / Shell',
    'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions', 'Firebase', 'Supabase', 'Vercel'
  ],
  design: [
    'UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Sketch',
    'Wireframing', 'Prototyping', 'User Research', 'Design Systems', 'Typography',
    'Color Theory', 'Responsive Design', 'Accessibility (a11y)', 'Motion Design', 'Branding'
  ]
};

// Switch active skill category tab and re-render chips
function switchSkillTab(tabKey) {
  currentSkillTab = tabKey;

  // Update tab button states
  document.querySelectorAll('.skill-tab').forEach(btn => btn.classList.remove('active'));
  const tabs = document.querySelectorAll('.skill-tab');
  const tabKeys = ['tech', 'soft', 'lang', 'tools', 'design'];
  const idx = tabKeys.indexOf(tabKey);
  if (tabs[idx]) tabs[idx].classList.add('active');

  // Show skills from this tab (respects active search query if any)
  const searchInput = document.getElementById('skills-search-input');
  const q = searchInput ? searchInput.value.trim() : '';
  renderSearchSuggestions(q);
}

// Render the clickable chip palette for the active tab
function renderChips() {
  const wrap = document.getElementById('skills-chips-wrap');
  if (!wrap) return;

  const chips = SKILL_LIBRARY[currentSkillTab] || [];
  wrap.innerHTML = chips.map(skill => {
    const isSelected = selectedSkills.includes(skill);
    return `<button class="skill-chip${isSelected ? ' selected' : ''}" onclick="toggleSkill('${skill.replace(/'/g, "\\'")}')">` +
      `${skill}</button>`;
  }).join('');
}

// Toggle a skill on/off from the predefined list
function toggleSkill(skillName) {
  if (selectedSkills.includes(skillName)) {
    removeSkill(skillName);
  } else {
    addSkill(skillName);
  }
}

// Add a skill to the selection
function addSkill(skillName) {
  const name = skillName.trim();
  if (!name || selectedSkills.includes(name)) return;
  selectedSkills.push(name);
  renderSelectedTags();
  renderChips();   // refresh chip state
  updatePreview();
}

// Remove a skill from the selection
function removeSkill(skillName) {
  selectedSkills = selectedSkills.filter(s => s !== skillName);
  renderSelectedTags();
  renderChips();   // refresh chip state
  updatePreview();
}

// Render the selected skill tag pills at the top of the skills box
function renderSelectedTags() {
  const tagsEl = document.getElementById('skills-selected-tags');
  const hintEl = document.getElementById('skills-empty-hint');
  if (!tagsEl) return;

  if (selectedSkills.length === 0) {
    tagsEl.innerHTML = '';
    if (hintEl) tagsEl.appendChild(hintEl);
    return;
  }

  // Remove hint if present
  if (hintEl && hintEl.parentNode) hintEl.parentNode.removeChild(hintEl);

  tagsEl.innerHTML = selectedSkills.map(skill =>
    `<span class="skill-tag" title="Click Ã— to remove">${esc(skill)}` +
    `<button class="skill-tag-remove" onclick="removeSkill('${skill.replace(/'/g, "\\'")}')">Ã—</button>` +
    `</span>`
  ).join('');
}

// Set skills programmatically (used by loadResume & clearEditor)
function setSelectedSkills(skillsArray) {
  selectedSkills = [...skillsArray];
  renderSelectedTags();
  renderChips();
}

// Handle Enter/comma key in the custom input
function handleCustomSkillKey(event) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    addCustomSkill();
  }
}

// Add a custom-typed skill
function addCustomSkill() {
  const inp = document.getElementById('skills-custom-input');
  if (!inp) return;
  const value = inp.value.trim().replace(/,+$/, '');
  if (!value) return;
  addSkill(value);
  inp.value = '';
  inp.focus();
}

// ──────────── Skills Search (new search-box UI) ────────────

// All skills flattened from the library
function getAllSkills() {
  return Object.values(SKILL_LIBRARY).flat();
}

// Render the chips area with search results or a default suggestion set
function renderSearchSuggestions(query) {
  const wrap = document.getElementById('skills-chips-wrap');
  const hint = document.getElementById('skills-search-hint');
  if (!wrap) return;

  const q = (query || '').trim().toLowerCase();

  let matches;
  if (q.length === 0) {
    // Show a diverse default selection (first 30 skills across categories)
    matches = getAllSkills().slice(0, 30);
  } else {
    matches = getAllSkills().filter(s => s.toLowerCase().includes(q));
  }

  let html = matches.map(skill => {
    const isSelected = selectedSkills.includes(skill);
    return `<button class="skill-chip${isSelected ? ' selected' : ''}" onclick="toggleSkill('${skill.replace(/'/g, "\\'")}')">` +
      `${esc(skill)}</button>`;
  }).join('');

  // If the user typed something that isn't in the library, offer to add it as custom
  const exactMatch = getAllSkills().some(s => s.toLowerCase() === q);
  if (q.length > 0 && !exactMatch && !selectedSkills.map(s => s.toLowerCase()).includes(q)) {
    const display = query.trim();
    html += `<button class="skill-chip skill-chip-custom" onclick="addSkill('${display.replace(/'/g, "\\'")}');document.getElementById('skills-search-input').value='';renderSearchSuggestions('');">+ Add "${esc(display)}"</button>`;
  }

  wrap.innerHTML = html || `<span style="color:var(--text-muted);font-size:0.85rem;">No matching skills found</span>`;

  if (hint) {
    hint.textContent = q.length === 0
      ? 'Type to search +100 skills across all categories'
      : `${matches.length} result${matches.length !== 1 ? 's' : ''}`;
  }
}

// Called by oninput on the search box
function onSkillSearch(event) {
  renderSearchSuggestions(event.target.value);
  // Re-render selected tags too in case a chip was toggled via Enter
  renderSelectedTags();
}

// Called by onkeydown on the search box — Enter adds the top match or custom skill
function onSkillSearchKey(event) {
  if (event.key !== 'Enter') return;
  event.preventDefault();

  const q = event.target.value.trim();
  if (!q) return;

  // Find an exact (case-insensitive) or first partial match
  const all = getAllSkills();
  const exact = all.find(s => s.toLowerCase() === q.toLowerCase());
  const partial = all.find(s => s.toLowerCase().includes(q.toLowerCase()));
  const toAdd = exact || partial || q;

  addSkill(toAdd);
  event.target.value = '';
  renderSearchSuggestions('');
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//   ATS ANALYSIS ENGINE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let atsResumeText = '';   // extracted text from uploaded file
let atsFileReady = false;

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Stopwords â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ATS_STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
  'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need',
  'this', 'that', 'these', 'those', 'i', 'we', 'you', 'he', 'she', 'it', 'they', 'me',
  'us', 'him', 'her', 'them', 'my', 'our', 'your', 'his', 'its', 'their', 'what', 'which',
  'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'not', 'only', 'same', 'so', 'than', 'too',
  'very', 'just', 'as', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'after',
  'before', 'between', 'out', 'off', 'over', 'under', 'per', 'within', 'without', 'while',
  'using', 'based', 'work', 'working', 'strong', 'ability', 'good', 'well', 'also',
  'new', 'role', 'team', 'position', 'company', 'including', 'experience', 'looking',
  'plus', 'join', 'provide', 'ensure', 'help', 'make', 'use', 'get', 'set', 'key',
  'required', 'requirements', 'must', 'preferred', 'responsibilities'
]);

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ File Upload Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function atsDragOver(e) {
  e.preventDefault();
  document.getElementById('ats-drop-zone').classList.add('drag-over');
}

function atsDragLeave(e) {
  document.getElementById('ats-drop-zone').classList.remove('drag-over');
}

function atsDrop(e) {
  e.preventDefault();
  document.getElementById('ats-drop-zone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) processATSFile(file);
}

function atsFileSelected(e) {
  const file = e.target.files[0];
  if (file) processATSFile(file);
}

function atsRemoveFile(e) {
  e.stopPropagation();
  atsResumeText = '';
  atsFileReady = false;
  // Reset UI
  document.getElementById('ats-drop-idle').style.display = '';
  document.getElementById('ats-drop-ready').style.display = 'none';
  document.getElementById('ats-preview-details').style.display = 'none';
  document.getElementById('ats-file-input').value = '';
  atsUpdateStep(1);
  atsCheckReady();
}

// ———————————— File Processing ————————————
const ATS_SUPPORTED_TYPES = ['pdf', 'docx', 'doc', 'txt', 'rtf', 'odt', 'html', 'htm'];

async function processATSFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!ATS_SUPPORTED_TYPES.includes(ext)) {
    showToast(`Unsupported file type ".${ext}". Supported: PDF, DOCX, DOC, TXT, RTF, ODT, HTML.`, 'warning');
    return;
  }

  // File-type icon mapping
  const iconMap = { pdf: '📄', docx: '📝', doc: '📝', txt: '📃', rtf: '📃', odt: '📃', html: '🌐', htm: '🌐' };

  // Show file info
  document.getElementById('ats-drop-idle').style.display = 'none';
  document.getElementById('ats-drop-ready').style.display = '';
  document.getElementById('ats-file-name').textContent = file.name;
  document.getElementById('ats-file-size').textContent = (file.size / 1024).toFixed(1) + ' KB';
  document.getElementById('ats-file-icon').textContent = iconMap[ext] || '📄';

  // Show parsing spinner
  document.getElementById('ats-parse-spinner').style.display = '';
  document.getElementById('ats-parse-ok').style.display = 'none';
  document.getElementById('ats-parse-err').style.display = 'none';
  atsFileReady = false;
  atsCheckReady();

  try {
    let text = '';
    if (ext === 'pdf') {
      text = await atsExtractPDF(file);
    } else if (ext === 'docx' || ext === 'doc') {
      text = await atsExtractDOCX(file);
    } else if (ext === 'txt' || ext === 'rtf') {
      text = await atsExtractPlainText(file);
    } else if (ext === 'odt') {
      text = await atsExtractODT(file);
    } else if (ext === 'html' || ext === 'htm') {
      text = await atsExtractHTML(file);
    }

    if (!text || text.trim().length < 30) {
      throw new Error('Extracted text is too short — the file may be image-based or empty.');
    }

    atsResumeText = text.trim();
    atsFileReady = true;

    // Show success
    document.getElementById('ats-parse-spinner').style.display = 'none';
    document.getElementById('ats-parse-ok').style.display = '';

    // Show text preview
    const preview = document.getElementById('ats-preview-text');
    preview.textContent = atsResumeText.slice(0, 1200) + (atsResumeText.length > 1200 ? '...' : '');
    document.getElementById('ats-preview-details').style.display = '';

    atsUpdateStep(2);
    atsCheckReady();

  } catch (err) {
    console.error('ATS parse error:', err);
    document.getElementById('ats-parse-spinner').style.display = 'none';
    document.getElementById('ats-parse-err').style.display = '';
    document.getElementById('ats-parse-err').textContent = '❌ ' + (err.message || 'Could not read file');
    atsFileReady = false;
    atsCheckReady();
  }
}

// ———————————— PDF Extraction (PDF.js) ————————————
async function atsExtractPDF(file) {
  if (typeof pdfjsLib === 'undefined') {
    throw new Error('PDF.js not loaded. Please check your internet connection.');
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const pageText = content.items.map(i => i.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText;
}

// ———————————— DOCX Extraction (Mammoth.js) ————————————
async function atsExtractDOCX(file) {
  if (typeof mammoth === 'undefined') {
    throw new Error('Mammoth.js not loaded. Please check your internet connection.');
  }
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// ———————————— Plain Text / RTF Extraction ————————————
async function atsExtractPlainText(file) {
  const text = await file.text();
  // Strip RTF control words if it's an RTF file
  if (file.name.toLowerCase().endsWith('.rtf')) {
    return text
      .replace(/\{\\\*[^}]*\}/g, '')          // remove \* destinations
      .replace(/\\[a-z]+[-]?\d*[ ]?/g, ' ')   // remove RTF control words
      .replace(/[{}]/g, '')                    // remove braces
      .replace(/\\'/g, '')                     // remove hex escape prefix
      .replace(/[ \t]+/g, ' ')                 // collapse whitespace
      .trim();
  }
  return text;
}

// ———————————— ODT Extraction (ZIP → content.xml) ————————————
async function atsExtractODT(file) {
  // ODT files are ZIP archives containing content.xml
  // We use the browser's built-in DecompressionStream (Chrome 80+, Edge 80+, FF 113+)
  // Fallback: read as text and strip XML tags (works when content is UTF-8 plain-ish)
  try {
    const arrayBuffer = await file.arrayBuffer();
    // Try to find content.xml inside the ZIP using a simple byte search
    const uint8 = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const raw = decoder.decode(uint8);
    // Extract the section between <text:...> tags (simplistic but effective for resumes)
    const xmlMatch = raw.match(/<office:body[\s\S]*?<\/office:body>/);
    if (xmlMatch) {
      return xmlMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    // Last resort: strip all XML tags from raw content
    return raw.replace(/<[^>]+>/g, ' ').replace(/[\x00-\x1F\x7F-\xFF]/g, ' ').replace(/\s+/g, ' ').trim();
  } catch (e) {
    throw new Error('Could not parse ODT file. Try converting it to PDF or DOCX first.');
  }
}

// ———————————— HTML Extraction ————————————
async function atsExtractHTML(file) {
  const html = await file.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Remove scripts and styles
  doc.querySelectorAll('script, style, noscript').forEach(el => el.remove());
  return (doc.body?.innerText || doc.documentElement.innerText || '').replace(/\s+/g, ' ').trim();
}

// ———————————— Step Indicators ————————————
function atsUpdateStep(active) {
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`ats-step-${i}`);
    if (!el) continue;
    el.classList.remove('active', 'done');
    if (i < active) el.classList.add('done');
    else if (i === active) el.classList.add('active');
  }
}

// ———————————— Enable/Disable Analyze Button ————————————
function atsCheckReady() {
  const jd = (document.getElementById('ats-jd-text')?.value || '').trim();
  const btn = document.getElementById('ats-analyze-btn');
  const hint = document.getElementById('ats-analyze-hint');
  const ready = atsFileReady && jd.length > 20;

  if (btn) btn.disabled = !ready;

  if (hint) {
    if (!atsFileReady && !jd.length) hint.textContent = 'Upload a resume and paste a job description to continue';
    else if (!atsFileReady) hint.textContent = 'Upload your resume (PDF, DOCX, TXT, RTF, ODT or HTML) to continue';
    else if (jd.length <= 20) hint.textContent = 'Paste a job description to continue';
    else hint.textContent = 'Everything looks good — click Analyze!';
  }

  if (atsFileReady && jd.length > 20) atsUpdateStep(3);
  else if (atsFileReady) atsUpdateStep(2);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Keyword Extractor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function extractKeywords(text) {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9#+.\-\/]/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 1 && !ATS_STOPWORDS.has(t));

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9# .\-\/]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !ATS_STOPWORDS.has(w));

  const bigrams = [];
  for (let i = 0; i < words.length - 1; i++) {
    if (!ATS_STOPWORDS.has(words[i]) && !ATS_STOPWORDS.has(words[i + 1])) {
      bigrams.push(`${words[i]} ${words[i + 1]}`);
    }
  }

  return new Set([...tokens, ...bigrams]);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Score Calculator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function scoreResume(resumeText, jdText) {
  const resumeKw = extractKeywords(resumeText);
  const jdKw = extractKeywords(jdText);

  const matched = [];
  const missing = [];

  jdKw.forEach(kw => {
    const found = [...resumeKw].some(rk =>
      rk === kw || rk.includes(kw) || (kw.includes(rk) && kw.length - rk.length < 4)
    );
    if (found) matched.push(kw);
    else missing.push(kw);
  });

  const filterDisplay = arr => [...new Set(
    arr.filter(k => k.length > 2).sort((a, b) => b.length - a.length)
  )].slice(0, 40);

  const total = matched.length + missing.length;
  const score = total === 0 ? 0 : Math.round((matched.length / total) * 100);

  return { score, matched: filterDisplay(matched), missing: filterDisplay(missing), total };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Grade System â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getGrade(score) {
  if (score >= 80) return { label: 'Excellent', cls: 'grade-excellent' };
  if (score >= 60) return { label: 'Good', cls: 'grade-good' };
  if (score >= 40) return { label: 'Fair', cls: 'grade-fair' };
  return { label: 'Needs Work', cls: 'grade-poor' };
}

function getScoreDesc(score, missingCount) {
  if (score >= 80) return `Outstanding match! Your resume aligns very well with this job. You're a strong candidate â€” ensure your experience section echoes the specific achievements they seek.`;
  if (score >= 60) return `Good match. You cover the core requirements, but adding ${Math.min(missingCount, 5)} more keywords from the missing list could push you into the top tier.`;
  if (score >= 40) return `Moderate match. Several important keywords are absent. Tailoring your resume to include skills and tools mentioned in the JD will significantly boost your chances.`;
  return `Low match. Your resume may be filtered out by ATS systems. Focus on incorporating the missing technical skills, tools, and role-specific language.`;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Tips Generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getATSTips(score, missing) {
  const tips = [];
  const top5 = missing.slice(0, 5);

  if (top5.length > 0) {
    tips.push(`Add these missing keywords to your skills or experience sections: <strong>${top5.join(', ')}</strong>.`);
  }
  if (score < 80) {
    tips.push(`Mirror the job description's exact wording. ATS systems often match keywords literally â€” "React.js" and "ReactJS" may be counted differently.`);
  }
  tips.push(`Use a clean, single-column layout (Classic or Minimal template) to ensure ATS parsers can read every section correctly.`);
  if (score < 60) {
    tips.push(`Rewrite your Professional Summary to naturally include 3â€“4 of the most important missing keywords.`);
    tips.push(`Quantify your achievements: "Reduced load time by 40%" beats "Improved performance" in both ATS ranking and recruiter appeal.`);
  }
  if (score >= 60) {
    tips.push(`Your profile is competitive. Strengthen it further by adding measurable results and numbers to your experience bullets.`);
  }
  tips.push(`Avoid tables, graphics, and text boxes â€” they confuse most ATS parsers and cause keywords to be missed.`);
  return tips.slice(0, 5);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Animate Score Ring â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function animateScoreRing(score) {
  const circumference = 314.16;
  const ring = document.getElementById('ats-ring-fill');
  const numEl = document.getElementById('ats-score-num');
  if (!ring || !numEl) return;

  const svg = ring.closest('svg');
  if (!svg.querySelector('#atsGrad')) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `<linearGradient id="atsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>`;
    svg.prepend(defs);
  }

  ring.style.strokeDashoffset = circumference;
  const target = circumference - (score / 100) * circumference;
  requestAnimationFrame(() => {
    ring.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)';
    ring.style.strokeDashoffset = target;
  });

  let current = 0;
  const step = Math.ceil(score / 60);
  const timer = setInterval(() => {
    current = Math.min(current + step, score);
    numEl.textContent = current + '%';
    if (current >= score) clearInterval(timer);
  }, 20);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Render Results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderATSResults({ score, matched, missing }) {
  const grade = getGrade(score);

  const gradeEl = document.getElementById('ats-score-grade');
  gradeEl.textContent = grade.label;
  gradeEl.className = `ats-score-grade ${grade.cls}`;

  document.getElementById('ats-stat-pills').innerHTML = `
    <div class="ats-stat-pill">
      <span class="ats-stat-value">${score}%</span>
      <span class="ats-stat-label">Overall Match</span>
    </div>
    <div class="ats-stat-pill">
      <span class="ats-stat-value" style="color:#4ade80;">${matched.length}</span>
      <span class="ats-stat-label">Keywords Found</span>
    </div>
    <div class="ats-stat-pill">
      <span class="ats-stat-value" style="color:#f87171;">${missing.length}</span>
      <span class="ats-stat-label">Keywords Missing</span>
    </div>`;

  document.getElementById('ats-score-desc').textContent = getScoreDesc(score, missing.length);

  document.getElementById('ats-matched-count').textContent = matched.length;
  document.getElementById('ats-matched-chips').innerHTML = matched.length
    ? matched.map(k => `<span class="ats-chip matched">${k}</span>`).join('')
    : `<span class="ats-empty-msg">No matched keywords found.</span>`;

  document.getElementById('ats-missing-count').textContent = missing.length;
  document.getElementById('ats-missing-chips').innerHTML = missing.length
    ? missing.map(k => `<span class="ats-chip missing">${esc(k)}<button class="ats-chip-add" onclick="atsAddKeywordToResume('${k.replace(/'/g, "\\'")}')">+ Add</button></span>`).join('')
    : `<span class="ats-empty-msg">ðŸŽ‰ All keywords matched!</span>`;

  document.getElementById('ats-tips-list').innerHTML =
    getATSTips(score, missing).map(t => `<li>${t}</li>`).join('');
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Main Entry Point â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function runATSAnalysis() {
  if (!atsFileReady || !atsResumeText) {
    showToast('Please upload your resume first.', 'warning');
    return;
  }
  const jdText = document.getElementById('ats-jd-text').value.trim();
  if (!jdText) {
    showToast('Please paste the job description.', 'warning');
    return;
  }

  const result = scoreResume(atsResumeText, jdText);
  const resultsEl = document.getElementById('ats-results');
  resultsEl.style.display = 'block';

  const ring = document.getElementById('ats-ring-fill');
  if (ring) ring.style.strokeDashoffset = '314.16';

  renderATSResults(result);
  setTimeout(() => animateScoreRing(result.score), 50);
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Mark step 3 done
  atsUpdateStep(4); // beyond 3 = all done
  [1, 2, 3].forEach(n => {
    const s = document.getElementById(`ats-step-${n}`);
    if (s) { s.classList.remove('active'); s.classList.add('done'); }
  });
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Reset â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function atsReset() {
  atsResumeText = '';
  atsFileReady = false;

  document.getElementById('ats-results').style.display = 'none';
  document.getElementById('ats-drop-idle').style.display = '';
  document.getElementById('ats-drop-ready').style.display = 'none';
  document.getElementById('ats-preview-details').style.display = 'none';
  document.getElementById('ats-jd-text').value = '';
  document.getElementById('ats-file-input').value = '';

  const ring = document.getElementById('ats-ring-fill');
  if (ring) { ring.style.transition = 'none'; ring.style.strokeDashoffset = '314.16'; }

  atsUpdateStep(1);
  atsCheckReady();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Init step indicators on page load
document.addEventListener('DOMContentLoaded', () => atsUpdateStep(1));

/* ============================================================
   CHATBOT — Resume Assistant
   ============================================================ */

// ─── State ───
let chatbotOpen = false;
let chatbotTyping = false;
const chatbotHistory = [];  // {role: 'user'|'bot', text, time}

// ─── Knowledge Base (rule-based responses) ───
const CHATBOT_KB = [
  {
    patterns: [/hello|hi|hey|good (morning|afternoon|evening)|howdy|greetings/i],
    responses: [
      "👋 Hi there! I'm your Resume Assistant. I can help you write a great resume, pick the right template, or improve your ATS score. What can I help you with?",
      "Hello! 😊 Ready to build an impressive resume? Ask me about templates, writing tips, or ATS optimization!"
    ]
  },
  {
    patterns: [/summar(y|ize)|about me|professional summary|write.*summary|summary.*write/i],
    responses: [
      "✍️ **Professional Summary Tips:**\n\n• Keep it 2–4 sentences (40–70 words)\n• Start with your years of experience + role\n• Highlight your top 2–3 skills\n• End with your value proposition\n\n**Example:** \"Results-driven Full-Stack Developer with 3+ years building scalable web apps using React and Node.js. Passionate about clean code and user-centric design, with a track record of reducing load times by 40%.\"\n\nWant a template to customize?",
      "📝 A great summary formula:\n\n**[Years] experienced [Role]** with expertise in **[Top Skills]**. Proven track record of **[Key Achievement]**. Seeking to bring **[Value]** to **[Target Role/Company]**.\n\nTip: Tailor it for each job by mirroring keywords from the job description!"
    ]
  },
  {
    patterns: [/ats|applicant tracking|ats score|beat.*ats|pass.*ats|ats.*tip/i],
    responses: [
      "⚡ **ATS Optimization Tips:**\n\n1. **Use exact keywords** from the job description\n2. **Avoid tables, columns, and graphics** — bots can't read them\n3. **Standard section headings**: Experience, Education, Skills\n4. **Spell out acronyms** — write \"JavaScript\" not just \"JS\"\n5. **Match the job title** to one you've actually held\n\nUse our **ATS Check** tool (⚡ in navbar) to instantly score your resume!",
      "🎯 Top ATS Tips:\n\n• Don't use headers/footers for contact info\n• Use a single-column layout (Classic or Minimal templates)\n• Include 10–15 keywords from the job posting\n• Save as PDF (our downloader handles this!)\n• Avoid fancy fonts — our templates use ATS-safe typography ✅"
    ]
  },
  {
    patterns: [/template|which.*template|best.*template|template.*best|recommend.*template/i],
    responses: [
      "🎨 **Template Guide:**\n\n• **Classic** — Best for corporate, finance, law — ATS-friendly ✅\n• **Sidebar** — Tech & design roles, modern two-column look 🖥️\n• **Minimal** — Clean, whitespace-heavy — great for senior roles\n• **Bold** — Commands attention — marketing, sales, startups\n• **Elegant** — Creative industries — designers, writers, artists\n\nWhat industry are you targeting?",
      "Not sure which template? Here's a quick guide:\n\n🏢 **Finance/Law/Healthcare** → Classic\n💻 **Tech/Engineering** → Sidebar or Minimal\n🎨 **Design/Creative** → Elegant\n📣 **Marketing/Sales** → Bold\n🎓 **Recent Graduate** → Classic or Minimal\n\nAll templates are ATS-compatible when exported as PDF!"
    ]
  },
  {
    patterns: [/skill(s)?|what skill|add.*skill|skill.*add|top skill|technical skill/i],
    responses: [
      "🛠️ **Skills to Include:**\n\n**Technical Skills:**\n• Programming: Python, JavaScript, Java, C++\n• Frameworks: React, Node.js, Django, Spring\n• Cloud: AWS, Azure, GCP, Docker, Kubernetes\n• DB: PostgreSQL, MongoDB, MySQL\n\n**Soft Skills:**\n• Leadership, Communication, Problem Solving\n• Agile/Scrum, Project Management\n\nTip: Only list skills you can confidently discuss in an interview!\n\nUse our Skills Picker in the Editor to add them instantly 👆",
      "For most tech jobs, include:\n• **Languages**: Python, JavaScript, TypeScript\n• **Frameworks**: React, Express, FastAPI\n• **Tools**: Git, Docker, Jira, VS Code\n• **Cloud**: AWS or Azure basics\n• **Databases**: SQL + one NoSQL\n\nFor soft skills, pick 3–4 that match the job description."
    ]
  },
  {
    patterns: [/experience|work.*experience|job.*experience|no experience|fresher|intern/i],
    responses: [
      "💼 **Writing Experience Entries:**\n\nUse the **STAR format**: Situation → Task → Action → Result\n\n❌ Bad: \"Worked on the website\"\n✅ Good: \"Redesigned checkout flow using React, reducing cart abandonment by 23%\"\n\n**No experience?** That's OK!\n• Include internships and part-time jobs\n• Add academic/personal projects\n• List volunteer work\n• GitHub contributions count!\n\nStart with Projects to show what you can build.",
      "💡 For fresher/entry-level resumes:\n\n1. **Lead with Education** — put it above experience\n2. **Add 3–5 strong projects** — they replace work experience\n3. **Internships** — even a 2-month one matters\n4. **Certifications** — Google, AWS, Udemy certificates show initiative\n5. **Skills section** — be thorough here\n\nUse our ATS Check to compare against the job description!"
    ]
  },
  {
    patterns: [/project(s)?|how.*add.*project|project.*tip|portfolio project/i],
    responses: [
      "🚀 **Writing Project Entries:**\n\n• **Name**: Clear and professional (e.g., \"E-Commerce Platform\", not \"My Shopping App\")\n• **Tech Stack**: List all major technologies used\n• **Description**: What it does + your role + metrics\n\n**Example:**\n*Resume Maker* | React, Node.js, Express\nBuilt a full-stack resume builder with 5 templates, live preview, PDF export, and ATS checking. Reduced resume build time by 80% compared to manual methods.\n\nLink to GitHub is a huge bonus! 💡"
    ]
  },
  {
    patterns: [/education|degree|gpa|certificate|course|uni|college|school/i],
    responses: [
      "🎓 **Education Section Tips:**\n\n• Put **GPA only if ≥ 3.5** (or if employer specifically asks)\n• List the **most recent degree first**\n• Include: Degree → Institution → Year\n• Add **relevant coursework** for entry-level roles\n• Certifications go here or in a separate section\n\n**Example:**\nB.S. Computer Science | MIT | 2020–2024\nRelevant: Data Structures, Algorithms, Web Dev, ML"
    ]
  },
  {
    patterns: [/pdf|download|export|print|file/i],
    responses: [
      "📄 To download your resume as PDF:\n\n1. Fill in your details in the **Editor** tab\n2. Click **\"👁️ Preview\"** to see the full layout\n3. Click **\"⬇ Download PDF\"**\n\nThe PDF is pixel-perfect and ATS-compatible. File size is usually under 200KB — perfect for job applications!\n\nPro tip: Name your file **FirstName_LastName_Resume.pdf** for professionalism."
    ]
  },
  {
    patterns: [/save|load|my resume|restore|export json|import/i],
    responses: [
      "💾 **Saving & Loading Resumes:**\n\n• Click **\"💾 Save Resume\"** to save to the server\n• View all your resumes under **\"My Resumes\"** in the navbar\n• Use **\"⬇ Export JSON\"** to download a backup file\n• Use **\"⬆ Import JSON\"** to restore from a backup\n\nYour data is stored locally on this server. For extra safety, export JSON backups regularly!"
    ]
  },
  {
    patterns: [/cover letter|motivation letter/i],
    responses: [
      "📬 **Cover Letter Tips:**\n\n• **Paragraph 1**: Why you want *this specific role* at *this company*\n• **Paragraph 2**: Your top 2–3 relevant achievements with metrics\n• **Paragraph 3**: What you'll bring to the team\n• **Closing**: Express enthusiasm, mention you're happy to discuss\n\nKeep it under 350 words. Customize for every application!\n\nNote: Cover letter writing isn't in the app yet, but I can help you draft one here!"
    ]
  },
  {
    patterns: [/linkedin|github|portfolio|website|url|link/i],
    responses: [
      "🔗 **Online Presence Tips:**\n\n• **LinkedIn**: Make sure your profile matches your resume exactly\n• **GitHub**: Pin your best 3–6 repositories\n• **Portfolio**: Even a simple GitHub Pages site works great\n\nAdd your links in the **Personal Info** section of the editor. Recruiters do click these!\n\nShort URLs look cleaner: *linkedin.com/in/yourname* instead of the full URL."
    ]
  },
  {
    patterns: [/length|how long|pages|one page|two page/i],
    responses: [
      "📏 **Resume Length Guide:**\n\n• **0–5 years experience**: 1 page ✅\n• **5–10 years experience**: 1–1.5 pages\n• **10+ years experience**: 2 pages max\n\nRecruiters spend ~7 seconds on first glance. Every word should earn its place!\n\n**To trim your resume:**\n• Remove jobs older than 10 years\n• Cut obvious skills (Microsoft Word, Internet)\n• Use bullet points, not paragraphs\n• Remove references line (just provide on request)"
    ]
  },
  {
    patterns: [/tip(s)?|advice|help|how to|guide|improve/i],
    responses: [
      "💡 **Quick Resume Tips:**\n\n1. **Quantify everything** — \"Increased sales by 30%\" beats \"Improved sales\"\n2. **Action verbs** — Led, Built, Designed, Reduced, Launched\n3. **Tailor for each job** — Match keywords from the posting\n4. **Proofread twice** — Typos = instant rejection\n5. **Use white space** — A clean layout is easier to scan\n6. **Check ATS score** — Use our ⚡ ATS Check tool!\n\nWhat specific area would you like help with?",
      "Top 5 resume mistakes to avoid:\n\n❌ Generic objective statement → ✅ Targeted professional summary\n❌ Responsibilities list → ✅ Achievements with metrics\n❌ Unprofessional email → ✅ firstname.lastname@gmail.com\n❌ One resume for all jobs → ✅ Tailored per application\n❌ Missing GitHub/LinkedIn → ✅ Include relevant profiles"
    ]
  },
  {
    patterns: [/thank(s| you)|great|awesome|perfect|helpful|nice/i],
    responses: [
      "You're welcome! 😊 Good luck with your job search! Remember, you can always use our **ATS Check** to make sure your resume matches the job description. Feel free to ask anything else!",
      "Happy to help! 🎉 Want me to review any other section of your resume? I'm here anytime you need guidance!"
    ]
  },
  {
    patterns: [/bye|goodbye|see you|cya|exit|close/i],
    responses: [
      "Goodbye! 👋 Best of luck with your job applications! Come back anytime you need resume help. You've got this! 🚀",
      "See you later! 😊 Remember — a great resume is your ticket to the interview. Good luck! 🍀"
    ]
  },
  {
    patterns: [/who are you|what are you|what can you do|your name|about you/i],
    responses: [
      "🤖 I'm the **Resume Assistant** — your AI-powered guide built into Resume Maker!\n\nI can help you with:\n• ✍️ Writing professional summaries\n• 🎨 Choosing the right template\n• ⚡ ATS optimization tips\n• 🛠️ Skills recommendations\n• 💼 Writing experience bullets\n• 📄 PDF export & saving\n\nJust type your question or pick a suggestion below!"
    ]
  }
];

// ─── Default fallback responses ───
const FALLBACK_RESPONSES = [
  "🤔 I specialize in resume advice! Try asking me about:\n• Writing a professional summary\n• ATS score improvement\n• Which template to choose\n• Skills to add for your field\n• How to format experience bullets",
  "That's a bit outside my expertise, but I'm great at resume tips! 😊 Ask me about templates, ATS optimization, writing skills, or how to structure your experience.",
  "Hmm, I'm not sure about that one. But I can definitely help you craft a standout resume! What section are you working on?",
];

// ─── Core Functions ───

function toggleChatbot() {
  chatbotOpen = !chatbotOpen;
  const win = document.getElementById('chatbot-window');
  const icon = document.getElementById('chatbot-toggle-icon');
  const dot = document.getElementById('chatbot-notif-dot');

  if (chatbotOpen) {
    win.classList.add('open');
    win.setAttribute('aria-hidden', 'false');
    icon.textContent = '✕';
    dot.classList.add('hidden');
    if (chatbotHistory.length === 0) {
      // Welcome message on first open
      setTimeout(() => {
        appendBotMessage("👋 Hi! I'm your **Resume Assistant**. I can help you write better resumes, choose templates, and boost your ATS score. What can I help you with today?");
      }, 300);
    }
    // Focus input
    setTimeout(() => document.getElementById('chatbot-input')?.focus(), 400);
  } else {
    win.classList.remove('open');
    win.setAttribute('aria-hidden', 'true');
    icon.textContent = '💬';
  }
}

function sendChatMessage() {
  const input = document.getElementById('chatbot-input');
  const text = (input?.value || '').trim();
  if (!text || chatbotTyping) return;

  input.value = '';
  appendUserMessage(text);
  showTypingIndicator();

  // Simulate a slight delay for realism
  const delay = 600 + Math.random() * 800;
  setTimeout(() => {
    hideTypingIndicator();
    const reply = getChatbotReply(text);
    appendBotMessage(reply);
  }, delay);
}

function sendSuggestedMessage(text) {
  const input = document.getElementById('chatbot-input');
  if (input) input.value = text;
  sendChatMessage();
}

function chatbotKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

function clearChatHistory() {
  chatbotHistory.length = 0;
  const msgs = document.getElementById('chatbot-messages');
  if (msgs) msgs.innerHTML = '';
  setTimeout(() => {
    appendBotMessage("Chat cleared! 🧹 Ready to help you build a great resume. What would you like to know?");
  }, 200);
}

function getChatbotReply(userText) {
  // Match against knowledge base
  for (const entry of CHATBOT_KB) {
    for (const pattern of entry.patterns) {
      if (pattern.test(userText)) {
        const responses = entry.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  }
  // Fallback
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

// ─── Rendering Helpers ───

function appendUserMessage(text) {
  chatbotHistory.push({ role: 'user', text, time: new Date() });
  const msgs = document.getElementById('chatbot-messages');
  if (!msgs) return;

  const el = document.createElement('div');
  el.className = 'chatbot-msg user';
  el.innerHTML = `
    <div class="chatbot-msg-avatar">👤</div>
    <div>
      <div class="chatbot-msg-bubble">${escapeHtml(text)}</div>
      <div class="chatbot-msg-time">${formatChatTime(new Date())}</div>
    </div>`;
  msgs.appendChild(el);
  scrollChatToBottom();
}

function appendBotMessage(text) {
  chatbotHistory.push({ role: 'bot', text, time: new Date() });
  const msgs = document.getElementById('chatbot-messages');
  if (!msgs) return;

  const el = document.createElement('div');
  el.className = 'chatbot-msg bot';
  el.innerHTML = `
    <div class="chatbot-msg-avatar">🤖</div>
    <div>
      <div class="chatbot-msg-bubble">${formatBotText(text)}</div>
      <div class="chatbot-msg-time">${formatChatTime(new Date())}</div>
    </div>`;
  msgs.appendChild(el);
  scrollChatToBottom();
}

function showTypingIndicator() {
  chatbotTyping = true;
  const msgs = document.getElementById('chatbot-messages');
  if (!msgs) return;
  const el = document.createElement('div');
  el.className = 'chatbot-typing';
  el.id = 'chatbot-typing-indicator';
  el.innerHTML = `
    <div class="chatbot-msg-avatar">🤖</div>
    <div class="chatbot-typing-dots">
      <span></span><span></span><span></span>
    </div>`;
  msgs.appendChild(el);
  scrollChatToBottom();
}

function hideTypingIndicator() {
  chatbotTyping = false;
  const el = document.getElementById('chatbot-typing-indicator');
  if (el) el.remove();
}

function scrollChatToBottom() {
  const msgs = document.getElementById('chatbot-messages');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

function formatChatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function formatBotText(text) {
  // Convert markdown-like syntax to HTML
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}



// ══════════════════════════════════════════
//   SMART WORDING SUGGESTIONS ENGINE
// ══════════════════════════════════════════

// ─── Action verbs by industry/role ───
const ACTION_VERBS = {
  tech: [
    'Architected','Built','Deployed','Engineered','Implemented','Optimized',
    'Automated','Developed','Designed','Integrated','Launched','Migrated',
    'Refactored','Scaled','Shipped','Debugged','Configured','Streamlined'
  ],
  management: [
    'Led','Managed','Directed','Spearheaded','Oversaw','Coordinated',
    'Championed','Mentored','Facilitated','Delegated','Initiated','Executed',
    'Established','Organized','Supervised','Trained','Cultivated','Guided'
  ],
  marketing: [
    'Launched','Grew','Increased','Drove','Boosted','Expanded','Promoted',
    'Crafted','Developed','Executed','Positioned','Amplified',
    'Optimized','Generated','Segmented','Leveraged','Monetized'
  ],
  design: [
    'Designed','Created','Produced','Conceptualized','Crafted','Illustrated',
    'Prototyped','Wireframed','Iterated','Revamped','Refined','Delivered',
    'Modernized','Transformed','Visualized','Collaborated'
  ],
  finance: [
    'Analyzed','Managed','Forecasted','Reduced','Maximized','Audited',
    'Reconciled','Budgeted','Assessed','Streamlined','Evaluated','Reported',
    'Modeled','Identified','Restructured','Achieved','Advised'
  ],
  general: [
    'Achieved','Accelerated','Collaborated','Contributed','Delivered',
    'Enhanced','Ensured','Improved','Increased','Partnered','Produced',
    'Reduced','Resolved','Strengthened','Supported','Transformed','Utilized'
  ]
};

// ─── Industry-specific phrase templates ───
const INDUSTRY_PHRASES = {
  tech: [
    'Improved system performance by X%',
    'Reduced latency from Xms to Yms',
    'Increased test coverage to X%',
    'Automated X manual processes saving Y hours/week',
    'Cut deployment time by X%',
    'Serving X million requests per day',
    'Implemented CI/CD pipeline reducing release cycle by X%',
    'Designed RESTful API endpoints used by X+ clients'
  ],
  management: [
    'Led a team of X engineers across Y locations',
    'Delivered project X weeks ahead of schedule',
    'Reduced team onboarding time by X%',
    'Achieved X% team retention rate',
    'Managed $XM budget with X% under-spend',
    'Increased quarterly output by X%',
    'Drove cross-departmental alignment across X teams'
  ],
  marketing: [
    'Grew organic traffic by X% in X months',
    'Increased conversion rate from X% to Y%',
    'Managed $XK monthly ad spend with X ROAS',
    'Generated X qualified leads per month',
    'Boosted email open rate to X%',
    'Launched X campaigns across Y channels',
    'Reduced customer acquisition cost by X%'
  ],
  design: [
    'Improved user satisfaction score by X%',
    'Reduced task completion steps from X to Y',
    'Conducted X user research sessions',
    'Created design system adopted by X product teams',
    'Increased task success rate by X%',
    'Reduced user drop-off by X% through UX improvements'
  ],
  finance: [
    'Managed portfolio worth $XM with X% annual return',
    'Reduced operational costs by X%',
    'Improved forecasting accuracy by X%',
    'Reconciled accounts across X entities with X% accuracy',
    'Identified $XK in cost savings',
    'Reduced budget variance to ±X%'
  ],
  general: [
    'Improved process efficiency by X%',
    'Collaborated with X cross-functional teams',
    'Delivered results X% ahead of target',
    'Supported X+ customers / stakeholders',
    'Reduced errors by X% in X months',
    'Saved X hours/week through process automation'
  ]
};

// ─── Weak phrase detection rules ───
const PHRASE_RULES = [
  { pattern: /\b(responsible for|in charge of|duties include|tasked with)\b/i, label: '⚠️ Remove passive "responsible for"', tip: 'Lead with an action verb. e.g., "Led X", "Managed X", "Delivered X"' },
  { pattern: /\bhelped\b/i, label: '⚠️ Replace "helped" with an ownership verb', tip: '"Helped" weakens your role. Try: "Co-developed", "Contributed to", "Collaborated to build"' },
  { pattern: /\bworked on\b/i, label: '⚠️ "Worked on" is too vague', tip: 'Be specific: "Built", "Engineered", "Redesigned", "Optimized", "Launched"' },
  { pattern: /\bwas involved\b/i, label: '⚠️ Avoid "was involved"', tip: 'Use active verbs: "Designed", "Developed", "Led", "Drove"' },
  { pattern: /\bgood (at|with|in)\b/i, label: '⚠️ Quantify your skill level', tip: 'Try: "Proficient in X", "5+ years of X experience", "Built 3 production X systems"' },
  { pattern: /\bteam player\b/i, label: '⚠️ "Team player" is a cliché', tip: 'Show it: "Collaborated with X designers to ship Y feature in Z weeks"' },
  { pattern: /\bhard[- ]?working\b/i, label: '⚠️ Skip "hardworking" — show outcomes', tip: '"Delivered 3 features ahead of sprint deadline" proves it better.' },
  { pattern: /\bpassionate (about|for)\b/i, label: '⚠️ Replace "passionate" with proof', tip: '"Built X side project", "Contributed to open-source Y" shows passion better.' },
  { pattern: /\betc\.?\b/i, label: '⚠️ Avoid "etc." — be specific', tip: 'List actual items. "Etc." signals you ran out of specifics to recruiters.' }
];

// ─── Detect industry from text ───
function detectIndustry(text) {
  if (!text) return 'general';
  if (/engineer|developer|software|frontend|backend|devops|machine learning|cloud|architect|sre|qa/i.test(text)) return 'tech';
  if (/manag|director|lead|head of|vp |chief|product manager|scrum/i.test(text)) return 'management';
  if (/market|seo|social media|content|brand|growth|campaign|digital ads/i.test(text)) return 'marketing';
  if (/design|ux|ui |product design|graphic|visual|motion design/i.test(text)) return 'design';
  if (/financ|account|invest|audit|budget|tax|banking|analyst|controller/i.test(text)) return 'finance';
  return 'general';
}

// ─── Build suggestion list ───
function generateSuggestions(text, contextHint) {
  const results = [];
  const jobTitle = document.getElementById('inp-title')?.value || '';
  const industry = detectIndustry(contextHint || jobTitle || text);

  // Weak phrase checks
  for (const rule of PHRASE_RULES) {
    if (rule.pattern.test(text)) {
      results.push({ type: 'warn', label: rule.label, tip: rule.tip });
    }
  }

  // Pronoun opener check
  if (text.trim() && /^(i |my |the |a |an |we )/i.test(text.trim())) {
    results.push({ type: 'warn', label: '⚠️ Don\'t start with "I", "My", or "The"', tip: 'Bullets should open with a strong action verb — recruiters prefer "Built X" over "I built X".' });
  }

  // Missing metrics
  if (text.length > 50 && !/\d/.test(text)) {
    results.push({ type: 'metric', label: '📊 Add a quantifiable metric', tip: 'Resumes with numbers get 40% more callbacks. Add a %, dollar amount, count, or time saved.', example: 'e.g., "reduced load time by 40%", "managed team of 8", "saved $25K annually"' });
  }

  // Verbs
  results.push({ type: 'verbs', label: '💪 Strong action verbs for ' + industry + ' roles', verbs: (ACTION_VERBS[industry] || ACTION_VERBS.general).slice(0, 14) });

  // Industry phrases
  results.push({ type: 'phrases', label: '🎯 High-impact phrase templates', phrases: (INDUSTRY_PHRASES[industry] || INDUSTRY_PHRASES.general).slice(0, 5) });

  return results;
}

// ─── Render cards ───
function renderSuggestions(suggestions) {
  if (!suggestions.length) return '<div class="ss-empty">✅ Looks great! No issues detected.</div>';
  let html = '';
  for (const s of suggestions) {
    if (s.type === 'warn') {
      html += `<div class="ss-card ss-card--warn"><div class="ss-card-label">${s.label}</div><div class="ss-card-tip">${s.tip}</div></div>`;
    } else if (s.type === 'metric') {
      html += `<div class="ss-card ss-card--metric"><div class="ss-card-label">${s.label}</div><div class="ss-card-tip">${s.tip}</div><div class="ss-card-example">${s.example}</div></div>`;
    } else if (s.type === 'verbs') {
      html += `<div class="ss-card ss-card--verbs"><div class="ss-card-label">${s.label}</div><div class="ss-verb-chips">${s.verbs.map(v => `<button class="ss-verb-chip" onclick="applyVerbSugg('${v}')">${v}</button>`).join('')}</div></div>`;
    } else if (s.type === 'phrases') {
      html += `<div class="ss-card ss-card--phrases"><div class="ss-card-label">${s.label}</div><div class="ss-phrase-list">${s.phrases.map(p => `<div class="ss-phrase-item"><span class="ss-phrase-text">"${p}"</span><button class="ss-phrase-use" onclick="applyPhraseSugg('${p.replace(/'/g, "\\'")}')">+ Use</button></div>`).join('')}</div></div>`;
    }
  }
  return html;
}

// ─── Panel state ───
let _ssTarget = null;

function openSmartSuggest(elemId, contextHint) {
  const el = document.getElementById(elemId) || document.querySelector(`[data-field="${elemId}"]`);
  if (!el) return;
  _ssTarget = el;
  const panel = document.getElementById('ss-panel');
  const body  = document.getElementById('ss-body');
  document.getElementById('ss-header-title').textContent =
    el.value.trim().length < 10 ? '✨ Smart Suggestions' : '✨ Smart Suggestions — Live Analysis';
  body.innerHTML = renderSuggestions(generateSuggestions(el.value.trim(), contextHint || el.value));
  panel.classList.add('ss-open');
}

function closeSmartSuggest() {
  document.getElementById('ss-panel')?.classList.remove('ss-open');
  _ssTarget = null;
}

function applyVerbSugg(verb) {
  if (!_ssTarget) return;
  const cur = _ssTarget.value.trim();
  const starters = ['responsible for ','in charge of ','i ','my ','the ','a ','we ','helped ','worked on '];
  let nv = cur;
  let found = false;
  for (const w of starters) {
    if (cur.toLowerCase().startsWith(w)) { nv = verb + ' ' + cur.slice(w.length); found = true; break; }
  }
  if (!found) {
    const sp = cur.indexOf(' ');
    nv = sp > 0 ? verb + cur.slice(sp) : verb + (cur ? ' ' + cur : '');
  }
  _ssTarget.value = nv;
  _ssTarget.dispatchEvent(new Event('input'));
  _ssTarget.focus();
  document.getElementById('ss-body').innerHTML = renderSuggestions(generateSuggestions(nv, nv));
  showToast('"' + verb + '" applied!');
}

function applyPhraseSugg(phrase) {
  if (!_ssTarget) return;
  const cur = _ssTarget.value;
  const sep = cur && !cur.endsWith(' ') ? '. ' : '';
  const nv  = cur + sep + phrase.charAt(0).toUpperCase() + phrase.slice(1);
  _ssTarget.value = nv;
  _ssTarget.dispatchEvent(new Event('input'));
  _ssTarget.focus();
  document.getElementById('ss-body').innerHTML = renderSuggestions(generateSuggestions(nv, nv));
  showToast('Phrase appended!');
}

// ══════════════════════════════════════════════════════════
//   ATS POWER ENGINE v2 — Multi-Factor Analysis
//   Replaces/extends the basic scoreResume() approach
// ══════════════════════════════════════════════════════════

// ─── Section Detection ───
// Detects presence of key resume sections from raw extracted text
const ATS_SECTIONS = [
  { key: 'contact',    label: 'Contact Info',          weight: 5,  patterns: [/\b(email|phone|linkedin|github|address|location|\@|tel:)/i] },
  { key: 'summary',   label: 'Professional Summary',  weight: 5,  patterns: [/\b(summary|objective|profile|about me|overview)\b/i] },
  { key: 'experience',label: 'Work Experience',        weight: 6,  patterns: [/\b(experience|employment|work history|career|positions?|jobs?)\b/i] },
  { key: 'education', label: 'Education',             weight: 4,  patterns: [/\b(education|degree|university|college|school|bachelor|master|phd|b\.?s\.?|m\.?s\.?)\b/i] },
  { key: 'skills',    label: 'Skills',                weight: 5,  patterns: [/\b(skills?|technical skills?|competencies|technologies|tools|stack)\b/i] },
  { key: 'projects',  label: 'Projects',              weight: 3,  patterns: [/\b(projects?|portfolio|open.?source|github\.com)\b/i] },
  { key: 'certs',     label: 'Certifications',        weight: 2,  patterns: [/\b(certif|license|credential|aws certified|google certified|coursera|udemy)\b/i] }
];

function checkSections(text) {
  const results = [];
  for (const s of ATS_SECTIONS) {
    const found = s.patterns.some(p => p.test(text));
    results.push({ ...s, found });
  }
  return results;
}

// ─── Formatting Issues Detector ───
const FORMAT_RULES = [
  {
    id: 'tables',
    severity: 'critical',
    label: 'Tables or columns detected',
    tip: 'Replace tables/columns with plain text — ATS parsers often skip table contents entirely.',
    test: t => /(\|\s*\||\t.*\t.*\t|\+[-+]+\+)/.test(t) || (t.match(/\t/g) || []).length > 15
  },
  {
    id: 'special_chars',
    severity: 'critical',
    label: 'Problematic special characters found',
    tip: 'Remove bullets like ■ ▶ ♦ and replace with standard hyphens (-). ATS bots misread these.',
    test: t => /[■▶♦•►◆→★☆▪▫◾◼▸▹]/.test(t)
  },
  {
    id: 'long_lines',
    severity: 'warning',
    label: 'Very long unpunctuated sentences found',
    tip: 'Break long blocks into concise bullet points starting with action verbs (max 2 lines each).',
    test: t => t.split(/\n/).some(line => line.length > 250 && !/[.!?]/.test(line.slice(-20)))
  },
  {
    id: 'no_email',
    severity: 'critical',
    label: 'No email address detected',
    tip: 'Include your email address in plain text at the top. Never put it only in a header/footer.',
    test: t => !/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(t)
  },
  {
    id: 'no_phone',
    severity: 'warning',
    label: 'No phone number detected',
    tip: 'Add a phone number. Use format: +1 234 567 8900 or (234) 567-8900.',
    test: t => !/(\+?\d[\d\s\-().]{7,}\d)/.test(t)
  },
  {
    id: 'too_short',
    severity: 'critical',
    label: 'Resume is too short (under 300 words)',
    tip: 'Add more detail to your experience and skills sections. Aim for 400–700 words minimum.',
    test: t => t.trim().split(/\s+/).length < 300
  },
  {
    id: 'too_long',
    severity: 'warning',
    label: 'Resume may be too long (over 1200 words)',
    tip: 'Trim to 1–2 pages max. Remove jobs older than 10 years and cut redundant information.',
    test: t => t.trim().split(/\s+/).length > 1200
  },
  {
    id: 'all_caps',
    severity: 'info',
    label: 'Multiple ALL-CAPS words outside headings',
    tip: 'Avoid writing in ALL CAPS in body text — some ATS bots have difficulty parsing them.',
    test: t => (t.match(/\b[A-Z]{4,}\b/g) || []).length > 10
  },
  {
    id: 'no_dates',
    severity: 'warning',
    label: 'No dates found in resume',
    tip: 'Add start and end dates to every experience and education entry. e.g., "Jan 2020 – Mar 2023".',
    test: t => !/\b(19|20)\d{2}\b/.test(t)
  },
  {
    id: 'passive_summary',
    severity: 'info',
    label: 'Summary uses weak/passive language',
    tip: 'Replace "responsible for" / "worked on" with strong action verbs like "Led", "Built", "Designed".',
    test: t => /(responsible for|worked on|tasked with|duties include|in charge of)/i.test(t)
  },
  {
    id: 'no_numbers',
    severity: 'warning',
    label: 'No quantified achievements detected',
    tip: 'Add metrics: "improved performance by 40%", "managed team of 8", "reduced costs by $25K".',
    test: t => !/\d+\s*%|\$[\d,]+|\d+\s*(million|thousand|users|clients|engineers|months|weeks|hours)/i.test(t)
  },
  {
    id: 'image_text',
    severity: 'critical',
    label: 'Possible image-embedded text (very sparse content)',
    tip: 'ATS cannot read text in images. Ensure all text is actual selectable text, not a scanned image.',
    test: t => t.length > 0 && t.trim().split(/\s+/).length < 50 && t.length > 200
  }
];

function checkFormatting(text) {
  return FORMAT_RULES.map(rule => ({
    ...rule,
    triggered: rule.test(text)
  })).filter(r => r.triggered);
}

// ─── Content Quality Checker ───
const CONTENT_ACTION_VERBS = new Set([
  'achieved','accelerated','architected','automated','built','championed',
  'collaborated','configured','created','delivered','deployed','designed',
  'developed','directed','drove','engineered','enhanced','established',
  'executed','generated','grew','identified','implemented','improved',
  'increased','initiated','integrated','launched','led','leveraged',
  'managed','mentored','migrated','optimized','organized','oversaw',
  'produced','reduced','refactored','resolved','scaled','shipped',
  'spearheaded','streamlined','strengthened','supervised','transformed'
]);

function checkContentQuality(text) {
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;

  // Count action verbs
  const verbCount = words.filter(w => CONTENT_ACTION_VERBS.has(w.replace(/[^a-z]/g,''))).length;
  const verbDensity = wordCount > 0 ? (verbCount / wordCount) * 100 : 0;

  // Count metric mentions
  const metrics = (text.match(/\d+\s*%|\$[\d,.]+|\d+\s*(million|thousand|users|clients|engineers|months|weeks|hours|points|x)/gi) || []).length;

  // Count quantified bullet-like items (starts with dash/bullet, has number)
  const quantifiedBullets = (text.match(/[-•]\s*[^\n]*\d+[^\n]*/g) || []).length;

  // Score
  let score = 0;
  if (verbCount >= 5) score += 5;
  if (verbCount >= 10) score += 3;
  if (verbDensity >= 1.5) score += 2;
  if (metrics >= 2) score += 3;
  if (metrics >= 5) score += 2;
  if (wordCount >= 300 && wordCount <= 1000) score += 3;
  if (quantifiedBullets >= 3) score += 2;

  return {
    score: Math.min(score, 15),
    verbCount,
    metrics,
    wordCount,
    quantifiedBullets,
    verbDensity: verbDensity.toFixed(1)
  };
}

// ─── Improved Keyword Scorer (40 points max) ───
function scoreKeywords(resumeText, jdText) {
  const resumeKw = extractKeywords(resumeText);
  const jdKw     = extractKeywords(jdText);

  const matched = [];
  const missing = [];

  // Count frequency of each JD keyword in the resume (bonus for repetition)
  const resumeLower = resumeText.toLowerCase();
  jdKw.forEach(kw => {
    const found = [...resumeKw].some(rk =>
      rk === kw || rk.includes(kw) || (kw.includes(rk) && kw.length - rk.length < 4)
    );
    if (found) {
      const freq = (resumeLower.match(new RegExp(kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'g')) || []).length;
      matched.push({ kw, freq });
    } else {
      missing.push(kw);
    }
  });

  const total = matched.length + missing.length;
  const rawPct = total === 0 ? 0 : matched.length / total;
  const keyScore = Math.round(rawPct * 40);

  const filterDisplay = arr => [...new Set(
    arr.filter(k => typeof k === 'string' ? k.length > 2 : k.kw.length > 2)
       .sort((a,b) => typeof a === 'string' ? b.length - a.length : b.freq - a.freq)
  )].slice(0, 40);

  return {
    keyScore,
    matched: filterDisplay(matched).map(m => typeof m === 'string' ? m : m.kw),
    missing: filterDisplay(missing),
    matchedRaw: matched,
    total
  };
}

// ─── Section Completeness Scorer (25 points max) ───
function scoreSections(sectionResults) {
  const coreRequired = ['contact','experience','education','skills'];
  const nice = ['summary','projects','certs'];

  let score = 0;
  for (const s of sectionResults) {
    if (s.found) {
      if (coreRequired.includes(s.key)) score += 5;   // 4 core × 5 = 20
      else if (s.key === 'summary') score += 3;        // summary = 3
      else score += 1;                                  // projects/certs = 1 each
    }
  }
  return Math.min(score, 25);
}

// ─── Formatting Scorer (20 points max) ───
function scoreFormatting(issues) {
  let penalty = 0;
  for (const issue of issues) {
    if (issue.severity === 'critical') penalty += 7;
    else if (issue.severity === 'warning') penalty += 3;
    else penalty += 1;
  }
  return Math.max(0, 20 - penalty);
}

// ─── Master Analysis Function ───
function atsFullAnalysis(resumeText, jdText) {
  const kw       = scoreKeywords(resumeText, jdText);
  const sections = checkSections(resumeText);
  const issues   = checkFormatting(resumeText);
  const content  = checkContentQuality(resumeText);

  const sectionScore  = scoreSections(sections);
  const formatScore   = scoreFormatting(issues);

  const totalScore = Math.min(100,
    kw.keyScore + sectionScore + formatScore + content.score
  );

  // Build priority actions list (highest-impact items first)
  const priorities = [];

  // Critical formatting issues first
  issues.filter(i => i.severity === 'critical').forEach(i => {
    priorities.push({ icon: '🚨', label: i.label, fix: i.tip, impact: 'high' });
  });

  // Missing core sections
  const coreSections = ['contact','summary','experience','education','skills'];
  sections.filter(s => !s.found && coreSections.includes(s.key)).forEach(s => {
    priorities.push({ icon: '📋', label: `Missing section: "${s.label}"`, fix: `Add a clear "${s.label.toUpperCase()}" heading with content.`, impact: 'high' });
  });

  // Warning-level format issues
  issues.filter(i => i.severity === 'warning').forEach(i => {
    priorities.push({ icon: '⚠️', label: i.label, fix: i.tip, impact: 'medium' });
  });

  // Missing top keywords
  if (kw.missing.length >= 5) {
    priorities.push({
      icon: '🔑',
      label: `${kw.missing.length} JD keywords missing from resume`,
      fix: `Add top missing terms: ${kw.missing.slice(0,4).join(', ')}…`,
      impact: 'high'
    });
  }

  // No metrics
  if (content.metrics < 2) {
    priorities.push({ icon: '📊', label: 'No quantified achievements detected', fix: 'Add numbers: "reduced latency by 40%", "managed 8 engineers", "saved $20K".', impact: 'medium' });
  }

  // Low verb density
  if (content.verbCount < 5) {
    priorities.push({ icon: '💪', label: 'Too few strong action verbs', fix: 'Start each bullet with: Led, Built, Designed, Optimized, Launched, Reduced…', impact: 'medium' });
  }

  return {
    totalScore,
    breakdown: [
      { label: 'Keyword Match',       score: kw.keyScore,    max: 40, color: '#6366f1', icon: '🔑' },
      { label: 'Section Coverage',    score: sectionScore,   max: 25, color: '#22c55e', icon: '📋' },
      { label: 'Formatting Quality',  score: formatScore,    max: 20, color: '#f59e0b', icon: '📐' },
      { label: 'Content Quality',     score: content.score,  max: 15, color: '#06b6d4', icon: '✍️' }
    ],
    matched: kw.matched,
    missing: kw.missing,
    sections,
    issues,
    content,
    priorities: priorities.slice(0, 6)
  };
}

// ─── Render the new results ───
function renderATSResultsFull(result) {
  const { totalScore, breakdown, matched, missing, sections, issues, priorities } = result;

  // 1. Grade + ring  (re-use existing animateScoreRing)
  const grade = getGrade(totalScore);
  const gradeEl = document.getElementById('ats-score-grade');
  gradeEl.textContent = grade.label;
  gradeEl.className = `ats-score-grade ${grade.cls}`;

  document.getElementById('ats-stat-pills').innerHTML = `
    <div class="ats-stat-pill">
      <span class="ats-stat-value">${totalScore}%</span>
      <span class="ats-stat-label">ATS Score</span>
    </div>
    <div class="ats-stat-pill">
      <span class="ats-stat-value" style="color:#4ade80;">${matched.length}</span>
      <span class="ats-stat-label">Keywords ✓</span>
    </div>
    <div class="ats-stat-pill">
      <span class="ats-stat-value" style="color:#f87171;">${missing.length}</span>
      <span class="ats-stat-label">Keywords ✗</span>
    </div>
    <div class="ats-stat-pill">
      <span class="ats-stat-value" style="color:#fbbf24;">${issues.length}</span>
      <span class="ats-stat-label">Format Issues</span>
    </div>`;

  document.getElementById('ats-score-desc').textContent = getScoreDesc(totalScore, missing.length);

  // 2. Score breakdown bars
  document.getElementById('ats-breakdown-bars').innerHTML = breakdown.map(b => {
    const pct = Math.round((b.score / b.max) * 100);
    return `<div class="ats-bk-row">
      <div class="ats-bk-meta">
        <span class="ats-bk-icon">${b.icon}</span>
        <span class="ats-bk-label">${b.label}</span>
        <span class="ats-bk-score">${b.score}/${b.max}</span>
      </div>
      <div class="ats-bk-track">
        <div class="ats-bk-fill" data-pct="${pct}" style="width:0%;background:${b.color};"></div>
      </div>
    </div>`;
  }).join('');

  // Animate bars after paint
  requestAnimationFrame(() => {
    document.querySelectorAll('.ats-bk-fill').forEach(el => {
      const pct = el.getAttribute('data-pct');
      setTimeout(() => { el.style.width = pct + '%'; }, 100);
    });
  });

  // 3. Priority actions
  const priorityBadge = document.getElementById('ats-priority-badge');
  const highCount = priorities.filter(p => p.impact === 'high').length;
  priorityBadge.textContent = `${priorities.length} action${priorities.length !== 1 ? 's' : ''}`;
  priorityBadge.style.background = highCount > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)';
  priorityBadge.style.color = highCount > 0 ? '#f87171' : '#fbbf24';

  document.getElementById('ats-priority-list').innerHTML = priorities.length
    ? priorities.map((p, i) => `
        <div class="ats-priority-item ats-priority-${p.impact}">
          <div class="ats-priority-num">${i + 1}</div>
          <div class="ats-priority-content">
            <div class="ats-priority-label">${p.icon} ${p.label}</div>
            <div class="ats-priority-fix">${p.fix}</div>
          </div>
          <div class="ats-priority-impact ats-impact-${p.impact}">${p.impact === 'high' ? '🔴 High' : '🟡 Medium'}</div>
        </div>`).join('')
    : '<div class="ats-no-issues">🎉 No critical actions needed!</div>';

  // 4. Formatting issues
  const formatBadge = document.getElementById('ats-format-badge');
  const critCount = issues.filter(i => i.severity === 'critical').length;
  formatBadge.textContent = `${issues.length} issue${issues.length !== 1 ? 's' : ''}`;
  formatBadge.style.background = critCount > 0 ? 'rgba(239,68,68,0.2)' : issues.length > 0 ? 'rgba(234,179,8,0.2)' : 'rgba(74,222,128,0.15)';
  formatBadge.style.color = critCount > 0 ? '#f87171' : issues.length > 0 ? '#fbbf24' : '#4ade80';

  document.getElementById('ats-format-list').innerHTML = issues.length
    ? issues.map(issue => `
        <div class="ats-issue-row">
          <span class="ats-issue-badge ats-issue-${issue.severity}">${
            issue.severity === 'critical' ? '🔴 Critical' :
            issue.severity === 'warning'  ? '🟡 Warning'  : 'ℹ️ Info'
          }</span>
          <div class="ats-issue-content">
            <div class="ats-issue-label">${issue.label}</div>
            <div class="ats-issue-tip">${issue.tip}</div>
          </div>
        </div>`).join('')
    : '<div class="ats-no-issues">✅ No formatting issues detected!</div>';

  // 5. Section health grid
  document.getElementById('ats-section-grid').innerHTML = sections.map(s => `
    <div class="ats-sh-item ${s.found ? 'found' : 'missing'}">
      <span class="ats-sh-icon">${s.found ? '✅' : '❌'}</span>
      <span class="ats-sh-label">${s.label}</span>
      ${s.found ? '' : '<span class="ats-sh-hint">Add this section!</span>'}
    </div>`).join('');

  // 6. Keywords
  document.getElementById('ats-matched-count').textContent = matched.length;
  document.getElementById('ats-matched-chips').innerHTML = matched.length
    ? matched.map(k => `<span class="ats-chip matched">${esc(k)}</span>`).join('')
    : `<span class="ats-empty-msg">No matched keywords found.</span>`;

  document.getElementById('ats-missing-count').textContent = missing.length;
  document.getElementById('ats-missing-chips').innerHTML = missing.length
    ? missing.map(k => `<span class="ats-chip missing">${esc(k)}<button class="ats-chip-add" onclick="atsAddKeywordToResume('${k.replace(/'/g,"\\'")}')">+ Add</button></span>`).join('')
    : `<span class="ats-empty-msg">🎉 All keywords matched!</span>`;

  // 7. Tips
  document.getElementById('ats-tips-list').innerHTML =
    getATSTips(totalScore, missing).map(t => `<li>${t}</li>`).join('');
}

// ─── Override runATSAnalysis to use new engine ───
// (redefine the existing function — JS allows this)
const _runATSAnalysisOriginal = runATSAnalysis;
window.runATSAnalysis = function() {
  if (!atsFileReady || !atsResumeText) {
    showToast('Please upload your resume first.', 'warning');
    return;
  }
  const jdText = document.getElementById('ats-jd-text').value.trim();
  if (!jdText) {
    showToast('Please paste the job description.', 'warning');
    return;
  }

  // Show loading state
  const btn = document.getElementById('ats-analyze-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span>⏳</span> Analyzing…'; }

  setTimeout(() => {
    const result = atsFullAnalysis(atsResumeText, jdText);
    const resultsEl = document.getElementById('ats-results');
    resultsEl.style.display = 'block';

    const ring = document.getElementById('ats-ring-fill');
    if (ring) ring.style.strokeDashoffset = '314.16';

    renderATSResultsFull(result);
    setTimeout(() => animateScoreRing(result.totalScore), 50);
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    [1, 2, 3].forEach(n => {
      const s = document.getElementById(`ats-step-${n}`);
      if (s) { s.classList.remove('active'); s.classList.add('done'); }
    });

    if (btn) { btn.disabled = false; btn.innerHTML = '<span>⚡</span> Analyze Match'; }
  }, 200);
};
