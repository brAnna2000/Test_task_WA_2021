'use strict';

(function() {
  class TagCreation extends HTMLElement {
    constructor() {
      
      super();

      const shadow = this.attachShadow({ mode: 'open' });
      const editableListContainer = document.createElement('div');
      let empty = {
        get keys(){
          return this._keys;
        },
        set keys(value) {
          this._keys = Object.values(value);
        }
      }

      let base = JSON.parse(localStorage.getItem('list')) || empty;
      empty.keys = base;

      editableListContainer.classList.add('editable-list');
      editableListContainer.innerHTML = `
        <style>
          .icon {
            background-color: #fff;
            border: none;
            cursor: pointer;
            float: right;
            font-size: 24px;
            width: 0%;
            margin-left: 0;
          }
        *{
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }
        .container{
            width: 400px;
            height: 400px;
            margin: 40px auto;
            padding: 0 20px;
            background-color: blue;
        }
        .tagAddition{
            padding: 40px 0;
            margin-top: 10px;
            text-align: center;
        }
        .tagAddition > input, button{
            display: inline-block;
            width: 40%;
        }
        button{
            margin-left: 20px;
        }
        input{
            text-align: center;
        }
        li{
            list-style-type: none;
            padding-left: 5px;
            margin-right: 20px;
        }
        ul{
            padding-top: 5px;
        }
        .tagsList{
            background-color: white;
            width: 310px;
            height: 200px;
            margin: 20px auto;
        }
        </style>
        <div class="container">
            <div class="tagAddition">
                <input class="add-new-list-item-input" type="text" placeholder="Tag"></input>
                <button class="editable-list-add-item" id="editable-list-add-item">Add</button> 
            </div>
            <div class="tagsList">
                <ul class="item-list">
                  ${empty._keys.map(item => `
                  <li class="super-li" name="${item}">${item}
                  <button class="editable-list-remove-item icon" id="editable-list-remove-item icon">×</button>
                  </li>
                  `).join('')}
                </ul>
            </div>
            <div>
              <input class="read-only" type="checkbox" name="readonly">
              <label for="readonly">Read only</label>
            </div>
        </div>
      `;            

      this.addListItem = this.addListItem.bind(this);
      this.readOnly = this.readOnly.bind(this);
      this.handleRemoveItemListeners = this.handleRemoveItemListeners.bind(this);
      this.removeListItem = this.removeListItem.bind(this);
      this.baseChange = this.baseChange.bind(this);     
      
      shadow.appendChild(editableListContainer);
    }
      
    addListItem(e) {

      const textInput = this.shadowRoot.querySelector('.add-new-list-item-input');
      if (textInput.value) {

      if (textInput.value.search(' ') != -1){
        textInput.value = textInput.value.replace(/\s+/g, ' ').trim();;
        let massiv = textInput.value.split(' ');
        massiv.forEach((item) =>{
          const li = document.createElement('li');
          const button = document.createElement('button');
          const childrenLength = this.itemList.children.length;
         
          li.textContent = item;
          li.classList.add("super-li");
          li.setAttribute('name', item);
          
          button.classList.add('editable-list-remove-item', 'icon');
          button.innerHTML = '×';

          this.itemList.appendChild(li);
          this.itemList.children[childrenLength].appendChild(button);
          this.handleRemoveItemListeners([button]);
          this.baseChange();
          
        });
        textInput.value = '';
      }
      else{
          const li = document.createElement('li');
          const button = document.createElement('button');
          const childrenLength = this.itemList.children.length;
          
          li.textContent = textInput.value;
          li.classList.add("super-li");
          li.setAttribute('name', textInput.value);
          
          button.classList.add('editable-list-remove-item', 'icon');
          button.innerHTML = '×';

          this.itemList.appendChild(li);
          this.itemList.children[childrenLength].appendChild(button);
          this.handleRemoveItemListeners([button]);
          this.baseChange();
          textInput.value = '';
      }
        
      }
      
    } 

    connectedCallback() {
      const removeElementButtons = [...this.shadowRoot.querySelectorAll('.editable-list-remove-item')];
      const addElementButton = this.shadowRoot.querySelector('.editable-list-add-item');
      const checkboxReadOnly = this.shadowRoot.querySelector('.read-only');

      this.itemList = this.shadowRoot.querySelector('.item-list');
      this.handleRemoveItemListeners(removeElementButtons);

      addElementButton.addEventListener('click', this.addListItem);
      checkboxReadOnly.addEventListener('click', this.readOnly);
    }

    baseChange(){
      let liList = this.shadowRoot.querySelectorAll('li');
      let secondBase = {
        data: {},
        get keys(){
          return this._keys;
        },
        set keys(value) {
          this._keys = Object.values(value);
        }
      };

      let index = 0;
      for (let elem of liList) {
        secondBase.data[index]=(elem.getAttribute("name"));
        index++;
      }
      index=0;
      localStorage.setItem('list',JSON.stringify(secondBase.data));
    }

    readOnly() {
      const buttonAdd = this.shadowRoot.getElementById("editable-list-add-item");
      const buttonDelete = [...this.shadowRoot.querySelectorAll('.editable-list-remove-item')];

      let readOnlyObject = {

        get add(){
          return this._add;
        },
        set add(value) {
          this._add = value.removeAttribute("disabled");
        },
        
        get delete(){
          return this._delete;
        },
        set delete(value) {
          this._delete = value.forEach(attr => {
            {
              attr.removeAttribute("disabled");
            }
          });
        },

        get addNone(){
          return this._addNone;
        },
        set addNone(value) {
          this._addNone = value.setAttribute("disabled", "disabled");
        },

        get deleteNone(){
          return this._deleteNone;
        },
        set deleteNone(value) {
          this._deleteNone = value.forEach(attr => {
            {
              attr.setAttribute("disabled", "disabled");
            }
          });
        },
      }
      if (buttonAdd.hasAttribute("disabled") == true) {

        readOnlyObject.add = buttonAdd;
        readOnlyObject.delete = buttonDelete;
      }
      else{

        readOnlyObject.addNone = buttonAdd;
        readOnlyObject.deleteNone = buttonDelete;
      }
      
    }

    handleRemoveItemListeners(arrayOfElements) {
      arrayOfElements.forEach(element => {
        element.addEventListener('click', this.removeListItem);
      });
      
    }

    removeListItem(e) {
      e.target.parentNode.remove();
      this.baseChange();
    }
    
  }
  
  customElements.define('tag-creation', TagCreation);
})();