import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './CVTemplate.css';

const CVTemplate = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    github: '',
    
    // Professional Information
    headline: '',
    summary: '',
    
    // Work Experience
    workExperience: [
      {
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        description: ''
      }
    ],
    
    // Education
    education: [
      {
        degree: '',
        institution: '',
        year: '',
        field: ''
      }
    ],
    
    // Skills
    skills: [
      {
        name: '',
        proficiency: 'Intermediate',
        yearsExperience: ''
      }
    ]
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (section, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleBasicInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addItem = (section) => {
    const templates = {
      workExperience: {
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        description: ''
      },
      education: {
        degree: '',
        institution: '',
        year: '',
        field: ''
      },
      skills: {
        name: '',
        proficiency: 'Intermediate',
        yearsExperience: ''
      }
    };

    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], templates[section]]
    }));
  };

  const removeItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatePDF = async () => {
    const element = document.getElementById('cv-preview');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    return pdf;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const pdf = await generatePDF();
      const pdfBlob = pdf.output('blob');
      
      // Create a temporary file for parsing
      const file = new File([pdfBlob], 'cv.pdf', { type: 'application/pdf' });
      
      // Call the save callback with the file
      if (onSave) {
        onSave(file, formData);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating CV. Please try again.');
    }
  };

  return (
    <div className="cv-template-container">
      <div className="cv-template-header">
        <h2>Create Your Professional CV</h2>
        <p>Fill out the form below to create a professional CV that will be perfectly parsed by our system.</p>
      </div>

      <div className="cv-template-content">
        <div className="cv-form">
          {/* Personal Information */}
          <section className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleBasicInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleBasicInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleBasicInputChange('email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleBasicInputChange('phone', e.target.value)}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleBasicInputChange('address', e.target.value)}
                placeholder="e.g., 123 Main Street, City, State 12345"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => handleBasicInputChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div className="form-group">
                <label>GitHub URL</label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => handleBasicInputChange('github', e.target.value)}
                  placeholder="https://github.com/yourusername"
                />
              </div>
            </div>
          </section>

          {/* Professional Information */}
          <section className="form-section">
            <h3>Professional Information</h3>
            <div className="form-group">
              <label>Professional Headline</label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => handleBasicInputChange('headline', e.target.value)}
                placeholder="e.g., Senior Software Developer"
              />
            </div>
            <div className="form-group">
              <label>Professional Summary</label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleBasicInputChange('summary', e.target.value)}
                placeholder="Write a brief summary of your professional background and key achievements..."
                rows="4"
              />
            </div>
          </section>

          {/* Work Experience */}
          <section className="form-section">
            <h3>Work Experience</h3>
            {formData.workExperience.map((exp, index) => (
              <div key={index} className="experience-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => handleInputChange('workExperience', index, 'title', e.target.value)}
                      placeholder="e.g., Senior Software Developer"
                    />
                  </div>
                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleInputChange('workExperience', index, 'company', e.target.value)}
                      placeholder="e.g., Tech Solutions Inc"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => handleInputChange('workExperience', index, 'startDate', e.target.value)}
                      placeholder="e.g., January 2020"
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => handleInputChange('workExperience', index, 'endDate', e.target.value)}
                      placeholder="e.g., Present or December 2023"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Job Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => handleInputChange('workExperience', index, 'description', e.target.value)}
                    placeholder="Describe your key responsibilities and achievements..."
                    rows="3"
                  />
                </div>
                
                {formData.workExperience.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem('workExperience', index)}
                    className="remove-btn"
                  >
                    Remove Experience
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem('workExperience')}
              className="add-btn"
            >
              Add Work Experience
            </button>
          </section>

          {/* Education */}
          <section className="form-section">
            <h3>Education</h3>
            {formData.education.map((edu, index) => (
              <div key={index} className="education-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleInputChange('education', index, 'degree', e.target.value)}
                      placeholder="e.g., Bachelor of Science in Computer Science"
                    />
                  </div>
                  <div className="form-group">
                    <label>Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleInputChange('education', index, 'institution', e.target.value)}
                      placeholder="e.g., University of Technology"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Year</label>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => handleInputChange('education', index, 'year', e.target.value)}
                      placeholder="e.g., 2020"
                    />
                  </div>
                  <div className="form-group">
                    <label>Field of Study</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => handleInputChange('education', index, 'field', e.target.value)}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                </div>
                
                {formData.education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem('education', index)}
                    className="remove-btn"
                  >
                    Remove Education
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem('education')}
              className="add-btn"
            >
              Add Education
            </button>
          </section>

          {/* Skills */}
          <section className="form-section">
            <h3>Skills</h3>
            {formData.skills.map((skill, index) => (
              <div key={index} className="skill-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Skill Name</label>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => handleInputChange('skills', index, 'name', e.target.value)}
                      placeholder="e.g., JavaScript"
                    />
                  </div>
                  <div className="form-group">
                    <label>Proficiency Level</label>
                    <select
                      value={skill.proficiency}
                      onChange={(e) => handleInputChange('skills', index, 'proficiency', e.target.value)}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Years of Experience</label>
                    <input
                      type="number"
                      value={skill.yearsExperience}
                      onChange={(e) => handleInputChange('skills', index, 'yearsExperience', e.target.value)}
                      placeholder="e.g., 5"
                      min="0"
                      max="50"
                    />
                  </div>
                </div>
                
                {formData.skills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem('skills', index)}
                    className="remove-btn"
                  >
                    Remove Skill
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem('skills')}
              className="add-btn"
            >
              Add Skill
            </button>
          </section>

          {/* Action Buttons */}
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="save-btn">
              Create CV
            </button>
          </div>
        </div>

        {/* CV Preview */}
        <div className="cv-preview">
          <h3>Preview</h3>
          <div id="cv-preview" className="cv-document">
            <div className="cv-header">
              <h1>{formData.firstName} {formData.lastName}</h1>
              {formData.headline && <h2>{formData.headline}</h2>}
              <div className="contact-info">
                {formData.email && <span>Email: {formData.email}</span>}
                {formData.phone && <span>Phone: {formData.phone}</span>}
                {formData.address && <span>Address: {formData.address}</span>}
                {formData.linkedin && <span>LinkedIn: {formData.linkedin}</span>}
                {formData.github && <span>GitHub: {formData.github}</span>}
              </div>
            </div>

            {formData.summary && (
              <section className="cv-section">
                <h3>Professional Summary</h3>
                <p>{formData.summary}</p>
              </section>
            )}

            {formData.workExperience.some(exp => exp.title) && (
              <section className="cv-section">
                <h3>Work Experience</h3>
                {formData.workExperience.map((exp, index) => (
                  exp.title && (
                    <div key={index} className="experience-entry">
                      <div className="experience-header">
                        <h4>{exp.title}</h4>
                        {exp.company && <span className="company">{exp.company}</span>}
                        {(exp.startDate || exp.endDate) && (
                          <span className="dates">
                            {exp.startDate} - {exp.endDate}
                          </span>
                        )}
                      </div>
                      {exp.description && <p>{exp.description}</p>}
                    </div>
                  )
                ))}
              </section>
            )}

            {formData.education.some(edu => edu.degree) && (
              <section className="cv-section">
                <h3>Education</h3>
                {formData.education.map((edu, index) => (
                  edu.degree && (
                    <div key={index} className="education-entry">
                      <h4>{edu.degree}</h4>
                      {edu.institution && <span className="institution">{edu.institution}</span>}
                      {edu.year && <span className="year">{edu.year}</span>}
                      {edu.field && <span className="field">{edu.field}</span>}
                    </div>
                  )
                ))}
              </section>
            )}

            {formData.skills.some(skill => skill.name) && (
              <section className="cv-section">
                <h3>Skills</h3>
                <div className="skills-list">
                  {formData.skills.map((skill, index) => (
                    skill.name && (
                      <div key={index} className="skill-entry">
                        <span className="skill-name">{skill.name}</span>
                        {skill.proficiency && <span className="proficiency">- {skill.proficiency}</span>}
                        {skill.yearsExperience && <span className="years">({skill.yearsExperience} years)</span>}
                      </div>
                    )
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVTemplate;
