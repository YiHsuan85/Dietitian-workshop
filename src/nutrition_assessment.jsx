import React, { useState } from 'react';

const NutritionAssessment = () => {
  const [data, setData] = useState({
    weight: '',
    height: '',
    age: '',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission, e.g., send data to an API or store it
    console.log('Submitted Data:', data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nutrition Consultation Assessment</h2>
      <label>
        Weight:
        <input 
          type="number" 
          name="weight" 
          value={data.weight} 
          onChange={handleChange} 
          required 
        />
      </label>
      <label>
        Height:
        <input 
          type="number" 
          name="height" 
          value={data.height} 
          onChange={handleChange} 
          required 
        />
      </label>
      <label>
        Age:
        <input 
          type="number" 
          name="age" 
          value={data.age} 
          onChange={handleChange} 
          required 
        />
      </label>
      <label>
        Notes:
        <textarea 
          name="notes" 
          value={data.notes} 
          onChange={handleChange} 
        ></textarea>
      </label>
      <button type="submit">Submit</button>
    </form>
  );
};

export default NutritionAssessment;