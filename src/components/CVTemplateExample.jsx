import React, { useState } from 'react';
import CVTemplate from './CVTemplate';
import './CVTemplateExample.css';

const CVTemplateExample = () => {
  const [showTemplate, setShowTemplate] = useState(false);
  const [uploadedCV, setUploadedCV] = useState(null);
  const [parsingResult, setParsingResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadedCV(file);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('cv', file);

      // Upload to backend for parsing
      const response = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setParsingResult(result);
      } else {
        throw new Error('Failed to parse CV');
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      alert('Error uploading CV. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateCV = async (file, formData) => {
    setIsUploading(true);
    setUploadedCV(file);

    try {
      // Create FormData for file upload
      const formDataUpload = new FormData();
      formDataUpload.append('cv', file);

      // Upload to backend for parsing
      const response = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formDataUpload,
      });

      if (response.ok) {
        const result = await response.json();
        setParsingResult(result);
        setShowTemplate(false);
      } else {
        throw new Error('Failed to parse CV');
      }
    } catch (error) {
      console.error('Error creating CV:', error);
      alert('Error creating CV. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelTemplate = () => {
    setShowTemplate(false);
  };

  const resetUpload = () => {
    setUploadedCV(null);
    setParsingResult(null);
    setIsUploading(false);
  };

  if (showTemplate) {
    return (
      <CVTemplate
        onSave={handleCreateCV}
        onCancel={handleCancelTemplate}
      />
    );
  }

  return (
    <div className="cv-template-example">
      <div className="example-header">
        <h1>CV Management System</h1>
        <p>Upload an existing CV or create a new one using our optimized template</p>
      </div>

      <div className="example-content">
        <div className="upload-section">
          <h2>Option 1: Upload Existing CV</h2>
          <div className="upload-area">
            <input
              type="file"
              id="cv-upload"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileUpload}
              disabled={isUploading}
              style={{ display: 'none' }}
            />
            <label htmlFor="cv-upload" className="upload-label">
              {isUploading ? (
                <div className="uploading">
                  <div className="spinner"></div>
                  <span>Processing CV...</span>
                </div>
              ) : (
                <div className="upload-content">
                  <div className="upload-icon">📄</div>
                  <span>Click to upload CV</span>
                  <small>Supports PDF, DOCX, DOC, TXT files</small>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="create-section">
          <h2>Option 2: Create New CV</h2>
          <p>Use our optimized template that ensures perfect parsing</p>
          <button
            className="create-btn"
            onClick={() => setShowTemplate(true)}
            disabled={isUploading}
          >
            Create New CV
          </button>
        </div>
      </div>

      {uploadedCV && (
        <div className="upload-result">
          <h3>Uploaded File</h3>
          <div className="file-info">
            <span className="file-name">{uploadedCV.name}</span>
            <span className="file-size">
              {(uploadedCV.size / 1024 / 1024).toFixed(2)} MB
            </span>
            <button onClick={resetUpload} className="reset-btn">
              Upload Another
            </button>
          </div>
        </div>
      )}

      {parsingResult && (
        <div className="parsing-result">
          <h3>Parsing Results</h3>
          {parsingResult.parsing_error ? (
            <div className="error-result">
              <h4>❌ Parsing Error</h4>
              <p>{parsingResult.parsing_error}</p>
            </div>
          ) : (
            <div className="success-result">
              <h4>✅ Successfully Parsed</h4>
              <div className="parsed-data">
                <div className="data-section">
                  <h5>Personal Information</h5>
                  <div className="data-grid">
                    <div><strong>Name:</strong> {parsingResult.first_name} {parsingResult.last_name}</div>
                    <div><strong>Email:</strong> {parsingResult.email}</div>
                    <div><strong>Phone:</strong> {parsingResult.phone}</div>
                    <div><strong>Address:</strong> {parsingResult.address}</div>
                    <div><strong>LinkedIn:</strong> {parsingResult.linkedin_url}</div>
                    <div><strong>GitHub:</strong> {parsingResult.github_url}</div>
                  </div>
                </div>

                {parsingResult.headline && (
                  <div className="data-section">
                    <h5>Professional Headline</h5>
                    <p>{parsingResult.headline}</p>
                  </div>
                )}

                {parsingResult.summary && (
                  <div className="data-section">
                    <h5>Professional Summary</h5>
                    <p>{parsingResult.summary}</p>
                  </div>
                )}

                {parsingResult.work_experience && parsingResult.work_experience.length > 0 && (
                  <div className="data-section">
                    <h5>Work Experience ({parsingResult.work_experience.length} entries)</h5>
                    {parsingResult.work_experience.map((exp, index) => (
                      <div key={index} className="experience-item">
                        <h6>{exp.title}</h6>
                        <div className="experience-details">
                          <span>{exp.company}</span>
                          <span>{exp.start_date} - {exp.end_date}</span>
                        </div>
                        {exp.description && <p>{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {parsingResult.education && parsingResult.education.length > 0 && (
                  <div className="data-section">
                    <h5>Education ({parsingResult.education.length} entries)</h5>
                    {parsingResult.education.map((edu, index) => (
                      <div key={index} className="education-item">
                        <h6>{edu.degree}</h6>
                        <div className="education-details">
                          <span>{edu.institution}</span>
                          <span>{edu.year}</span>
                        </div>
                        {edu.field && <p>Field: {edu.field}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {parsingResult.skills && parsingResult.skills.length > 0 && (
                  <div className="data-section">
                    <h5>Skills ({parsingResult.skills.length} skills)</h5>
                    <div className="skills-grid">
                      {parsingResult.skills.map((skill, index) => (
                        <div key={index} className="skill-item">
                          <span className="skill-name">{skill.name}</span>
                          {skill.proficiency && <span className="skill-level">({skill.proficiency})</span>}
                          {skill.years_experience && <span className="skill-years">{skill.years_experience} years</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="data-section">
                  <h5>Experience Summary</h5>
                  <p><strong>Total Years of Experience:</strong> {parsingResult.years_experience || 0} years</p>
                  <p><strong>Parsed at:</strong> {new Date(parsingResult.parsed_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CVTemplateExample;
