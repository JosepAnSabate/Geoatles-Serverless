export const mapForm = `
      <Popup>
      <form onSubmit={handleSubmit} className="form">
      <label>Títol</label>
      <input  
          type="text" 
          name="title" 
          className="input"
          
      /> 
      <br /> 
      <button onSubmit={handleChange}>Afegeix Posició</button>
      </form>
      </Popup>
      `