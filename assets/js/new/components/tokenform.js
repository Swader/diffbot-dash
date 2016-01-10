Vue.component('tokenform', {
    template: `
        <form @submit.prevent.stop action="#" method="get"
          class="sidebar-form">
        <div class="input-group">
            <input type="{{ type }}" autocomplete="off" name="q"
                   id="tokenInput"
                   class="form-control"
                   value="{{token}}"
                   placeholder="Enter token"
                   @keyup.enter="tokensave">
              <span class="input-group-btn">
                  <!--
                  The below invisible submit button is a mock button because, stupidly, the browser default is to
                  TRIGGER A CLICK EVENT ON THE NEAREST BUTTON WHEN ENTER IS PRESSED INSIDE A FORM INPUT
                  -->
                  <input type="submit" value="Whatever" style="display: none;">
                <button @click="tokenshow" type="submit" name="search"
                        id="unmask-btn"
                        class="btn btn-flat"><i class="ion-eye"></i>
                </button>
                <button @click="tokensave" type="submit" name="search"
                        id="search-btn"
                        class="btn btn-flat"><i class="ion-checkmark"></i>
                </button>
              </span>
        </div>
    </form>
    `,
    props: ['token'],
    data: function () {
        return {
            type: "password"
        }
    },
    methods: {
        tokenshow: function () {
            this.type = (this.type == "password") ? "text" : "password";
        },
        tokensave: function (event) {
            event.target.blur();
            this.$dispatch('token-saved', document.getElementById('tokenInput').value);
        }
    }
});