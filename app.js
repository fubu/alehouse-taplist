;let TapList = (function () {

  let TapDetailComponent = Vue.component('tap-detail', {
    props: ['tapNr', 'beer'],
    template: `
      <div class="tap-detail-container">
        <div class="tap-nr-container">
          <p class="tap-nr" v-if="tapNr">{{tapNr}}</p>
        </div>

        <template v-if="beer">
          <div class="beer-logo">
            <img :src="beer.logo" height="100%">
          </div>
            <div class="beer-info">
            <p class="beer-producer">{{beer.producer.name}} ({{beer.producer.origin}})</p>
            <p class="beer-name tall" :title="beer.name"><b>{{beer.name}}</b></p>
            <p class="beer-style">{{beer.style}}</p>
          </div>
          <div class="beer-pricing">
            <p class="beer-serving-size">{{beer.serving.size}}l</p>
            <p class="beer-price tall"><b>{{beer.serving.price}}</b></p>
            <p class="beer-abv">ABV {{beer.abv}}%</p>
          </div>
          <div class="beer-keg">
            <p>KEG:</p>
            <p class="tall">{{beer.kegLevel}}%</p>
          </div>
                  
          <div class="beer-ratings">
            <p>Ratings:
                <a v-if="beer.links.beerAdvocate" :href="beer.links.beerAdvocate">BeerAdvocate</a>
              | <a v-if="beer.links.rateBeer" :href="beer.links.rateBeer">RateBeer</a>
              | <a v-if="beer.links.untappd" :href="beer.links.untappd">Untappd</a>
            </p>
          </div>
        </template>
        <p class="not-in-use" v-else>Currently not in Use</p>
      </div>`
  });

  let TapListComponent = Vue.component('tap-list', {
    props: ['taps', 'handPump'],
    components: {
      'tap-detail': TapDetailComponent
    },
    template: `
      <div>
        <template v-if="taps.show">
          <h2>{{ taps.title }}</h2>
          <ul class="tap-list">
            <li class="tap-list-item" v-for="(tap, tapNr) of taps.data">
              <tap-detail :beer="tap" :tap-nr="tapNr + 1" :key="tapNr"></tap-detail>
            </li>
          </ul>
        </template>
        
        <template v-if="handPump.show">
          <h2>{{ handPump.title }}</h2>
          <div class="hand-pump">
            <tap-detail :beer="handPump.data" :tap-nr="'HP'"></tap-detail>
          </div>
        </template>
      </div>`,
  });

  var app = new Vue({
    el: '#tap-list-app',
    components: {
      'loading-indicator': VueSpinner.PulseLoader,
      'tap-list': TapListComponent,
    },
    template: `
      <div>
        <loading-indicator :loading="!isDataFetchCompleted"></loading-indicator>
        <tap-list v-if="isDataFetchCompleted"
                  :taps="taps" :hand-pump="handPump"></tap-list>
      </div>`,
    data: {
      taps: {
        show: true,
        title: 'Currently on Tap:',
        data: Array(20),
      },
      handPump: {
        show: true,
        title: 'And on the Hand Pump:',
        data: null,
      },
      isDataFetchCompleted: false,
    },
  });

  function mapBeersToTaps(response) {
    response.forEach(function extractBeer(menuItem) {
      let details = menuItem.MenuItemProductDetail;
      let beverage = details.Beverage;

      let serving = null;
      for (let price of details.Prices) {
        if (price.DisplayOnMenu) {
          serving = {
            size: parseFloat(price.DisplayName, 10).toFixed(2),
            price: price.Price.toFixed(2),
          };
          break;
        }
      };

      let links = {
        beerAdvocate: beverage.BeerAdvocateUrl,
        rateBeer: beverage.RateBeerUrl,
        untappd: beverage.UntappdUrl,
      };

      let beer = {
        name: beverage.CultureAwareBeverageName,
        producer: {
          name: beverage.BeverageProducer.ProducerName,
          origin: beverage.BeverageProducer.Location,
        },
        style: beverage.FullStyleName.trim(),
        abv: beverage.Abv,
        logo: beverage.ResolvedLogoImageUrl,
        kegLevel: (100 * details.PercentFull).toFixed(0),
        serving: serving,
        links: links,
      };

      let tapNr = menuItem.MenuItemDisplayDetail.DisplayOrder;
      if (tapNr > 20) {
        app.handPump.data = beer;
      } else {
        Vue.set(app.taps.data, tapNr - 1, beer);
      }
    });
    app.isDataFetchCompleted = true;
  };

  return {
    load: function (data) {
      mapBeersToTaps(data)
    }
  }

})();
