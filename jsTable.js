document.addEventListener('DOMContentLoaded', function () {

  // Funzione per mostrare il modale con titolo e azioni specifiche
  function showModal(action, id) {
      // Rimuovi eventuali ascoltatori di evento precedentemente associati al form
      const form = document.getElementById("modalForm");
      resetEvent(form);

      document.getElementById("Modal").style.display = "block";
      document.getElementById("modal_title").textContent = action;
      lbl_id = document.getElementById("lbl_id");
      input_id = document.getElementById("id");
      btn_sub = document.getElementById("btn_submit");
      lbl_id.style.display = input_id.style.display = "block";
      btn_sub.style.display = "block";
      document.getElementById("id").readOnly = false;
      document.getElementById("marca").readOnly = false;
      document.getElementById("modello").readOnly = false;
      document.getElementById("prezzo").readOnly = false;
      switch (action) {
          case "Show":
              btn_sub.style.display = "none";
              document.getElementById("id").readOnly = true;
              document.getElementById("marca").readOnly = true;
              document.getElementById("modello").readOnly = true;
              document.getElementById("prezzo").readOnly = true;
              show(id);
              break;
          case "Edit":
              lbl_id.style.display = input_id.style.display = "none";
              show(id);
              update(id);
              break;
          case "Delete":
              document.getElementById("id").readOnly = true;
              document.getElementById("marca").readOnly = true;
              document.getElementById("modello").readOnly = true;
              document.getElementById("prezzo").readOnly = true;
              show(id);
              Delete(id);
              break;
          case "Create":
              lbl_id.style.display = input_id.style.display = "none";
              create();
      }
  }

  function show(id) {
      fetch('http://localhost:8888/products/' + id, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
              },
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Errore durante la richiesta GET');
              }
              return response.json();
          })
          .then(data => {
              document.getElementById("id").value = data.data.id;
              document.getElementById("marca").value = data.data.attributes.marca;
              document.getElementById("modello").value = data.data.attributes.modello;
              document.getElementById("prezzo").value = data.data.attributes.prezzo;
          })
          .catch(error => {
              console.error('Si è verificato un errore:', error);
          });
  }

  function resetEvent(form) {
      form.removeEventListener('submit', handleDelete);
      form.removeEventListener('submit', handleSubmit);
      form.removeEventListener('submit', handleUpdate);
  }

  function Delete(id) {
      const form = document.getElementById("modalForm");
      // Rimuovi eventuali ascoltatori di evento precedentemente associati al form
      resetEvent(form);
      // Aggiungi l'ascoltatore di evento al form
      De = function (event) {
        handleDelete(event, id, form); // Passa l'ID a handleDelete
        form.removeEventListener('submit', De);
      };
      form.addEventListener('submit', De);
  }

  function handleDelete(event, id) {
      event.preventDefault();
      fetch('http://localhost:8888/products/' + id, {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
              },
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Errore durante la richiesta DELETE');
              }
          })
          .then(data => {
              closeModal();
              btn_del = document.getElementById("btn_delete" + id);
              row = btn_del.parentNode.parentNode;
              row.remove();
          })
          .catch(error => {
              console.error('Si è verificato un errore:', error);
          });
  }

  function update(id) {
      const form = document.getElementById("modalForm");
      // Rimuovi eventuali ascoltatori di evento precedentemente associati al form
      resetEvent(form);
      // Aggiungi l'ascoltatore di evento al form
      Up = function (event) {
        handleUpdate(event, id, form); // Passa l'ID a handleDelete
        form.removeEventListener('submit', Up);
      };
      form.addEventListener('submit', Up);
      

  }

  function updateRow(id, data) {
      const btn_edit = document.getElementById("btn_edit" + id);
      const row = btn_edit.parentNode.parentNode;
      const cells = row.cells; // 'cells' corretto, non 'celles'

      cells[1].textContent = data['attributes']['marca']; // Accedi correttamente ai dati usando 'attributes'
      cells[2].textContent = data['attributes']['modello'];
      cells[3].textContent = data['attributes']['prezzo'];
  }

  function handleUpdate(event, id, form) {
      event.preventDefault(); // Previene il comportamento predefinito di invio del modulo
      const formData = new FormData(form); // Ottiene i dati del modulo
      const requestData = {
          data: {
              attributes: {
                  marca: formData.get('marca'),
                  modello: formData.get('modello'),
                  prezzo: formData.get('prezzo')
              }
          }
      };
      fetch('http://localhost:8888/products/' + id, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestData),
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Errore durante la richiesta POST');
              }
              return response.json();
          })
          .then(data => {
              closeModal();
              updateRow(id, data.data);
          })
          .catch(error => {
              console.error('Si è verificato un errore:', error);
          });
  }

  function create() {
      const form = document.getElementById("modalForm");
      // Rimuovi eventuali ascoltatori di evento precedentemente associati al form
      resetEvent(form);
      // Aggiungi l'ascoltatore di evento al form
      form.addEventListener('submit', handleSubmit);

  }

  function handleSubmit(event) {
      event.preventDefault(); // Previene il comportamento predefinito di invio del modulo
      const formData = new FormData(this); // Ottiene i dati del modulo
      const requestData = {
          data: {
              attributes: {
                  marca: formData.get('marca'),
                  modello: formData.get('modello'),
                  prezzo: formData.get('prezzo')
              }
          }
      };
      fetch('http://localhost:8888/products', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestData),
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Errore durante la richiesta POST');
              }
              return response.json();
          })
          .then(data => {
              document.getElementById("Modal").style.display = "none";
              document.getElementById("modalForm").reset();
              addElement(data.data);
          })
          .catch(error => {
              console.error('Si è verificato un errore:', error);
          });
  }

  function addElement(data) {
      const productTableBody = document.getElementById('list');
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
    <td>${data.id}</td>
    <td>${data.attributes.marca}</td>
    <td>${data.attributes.modello}</td>
    <td>${data.attributes.prezzo}</td>
    <td>
    <button id ="btn_show${data.id}" type="button" class="btn btn-primary">Show</button>
    <button id ="btn_edit${data.id}" type="button" class="btn btn-primary">Edit</button>
    <button id ="btn_delete${data.id}" type="button" class="btn btn-primary">Delete</button>
    </td>
      `;
      productTableBody.appendChild(newRow);
      document.getElementById(`btn_show${data.id}`).onclick = function () {
          showModal("Show", data.id);
      };
      document.getElementById(`btn_edit${data.id}`).onclick = function () {
          showModal("Edit", data.id);
      };
      document.getElementById(`btn_delete${data.id}`).onclick = function () {
          showModal("Delete", data.id);
      };
  }

  // Funzione per chiudere il modale e ripristinare il form
  function closeModal() {
      document.getElementById("Modal").style.display = "none";
      document.getElementById("modalForm").reset();
  }

  // Effettua una richiesta GET al server per ottenere i dati dei prodotti
  fetch('http://localhost:8888/products')
      .then(response => response.json())
      .then(data => {
          // Visualizza i dati ottenuti nella tabella HTML
          // Itera attraverso i dati dei prodotti e crea le righe della tabella per visualizzare ogni prodotto
          data.data.forEach(product => {
              addElement(product);
          });
          document.getElementById("btn_create").onclick = function () {
              showModal("Create", 1)
          }
      })
      .catch(error => {
          console.error('Si è verificato un errore:', error);
      });

  // Gestione onclick per il pulsante di chiusura del modale
  document.getElementById("btn_close").onclick = document.getElementById("btn-close").onclick = function () {
      closeModal();
  };
});