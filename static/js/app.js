// Initializing the page and calling the other functions
function getData() {

  // Grabbing the dropdown element
  let selector = d3.select('#selDataset');

  d3.json("samples.json").then(function(samplesData){
      let names = samplesData.names;

      selector.selectAll('option')
          .data(names)
          .enter()
          .append('option')
          .attr('value', d => d)
          .text(d => d);

      // Take in the first name upon loading the page
      let firstName = names[0];

      // Call other functions using first name
      buildPlots(firstName);
      demographics(firstName);

  }).catch(error => console.log(error));
};

// Dynamic changing of plots and demographics upon change in dropdown
function optionChanged(newID){
  buildPlots(newID);
  demographics(newID);
};

// Building Bar Chart and Bubble Chart
function buildPlots(id) {
  // Reading in the json dataset
  d3.json("samples.json").then(function(samplesData){
      // console.log(samplesData);
      // Filtering for the id selected
      let filtered = samplesData.samples.filter(sample => sample.id == id);
      let result = filtered[0];
      // console.log(filtered)
      // console.log(result)

      // creating OTU bars and storing the top 10 in an array

      Data = [];
      for (i=0; i<result.sample_values.length; i++){
          Data.push({
              id: `OTU ${result.otu_ids[i]}`,
              value: result.sample_values[i],
              label: result.otu_labels[i]
          });
      }
      // console.log(Data);

      // Sorting the data and slicing for top10
      let Sorted = Data.sort(function sortFunction(a,b){
          return b.value - a.value;
      }).slice(0,10);
      // console.log(Sorted)

      // Reverse to display from top to bottom in descending order
      let reversed = Sorted.sort(function sortFunction(a,b){
          return a.value - b.value;
      })
      // console.log(reversed);

      // Trace for Horizontal Bar Chart
      let colors = ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1']
      let traceBar = {
          type: "bar",
          orientation: 'h',
          x: reversed.map(row=> row.value),
          y: reversed.map(row => row.id),
          text: reversed.map(row => row.label),
          mode: 'markers',
          marker: {
              color: colors
          }
        };
      
      let Bardata = [traceBar];
        
      let Barlayout = {
          title: `<span style='font-size:1em; color:#263238'><b>Top 10 OTUs<b></span>`,
          xaxis: {autorange: true, title: 'Sample Values'},
          yaxis: {autorange: true},
          width: 500,
          height: 500
        };
      
      // Creating the Horizontal Bar Chart
      Plotly.newPlot("bar", Bardata, Barlayout);

      // Bubble Chart
      let traceBubble = {
          x: result.otu_ids,
          y: result.sample_values,
          mode: 'markers',
          marker: {
              size: result.sample_values,
              color: result.otu_ids,
              colorscale: 'Jet'
          },
          text: result.otu_labels
      };

      let Bubbledata = [traceBubble]

      let Bubblelayout = {
          title: `<span style='font-size:1em; color:#263238'><b>OTU Bubble Chart<b></span>`,
          xaxis: {title:'OTU ID'},
          yaxis: {title: 'Sample Values'},
          width: window.width
      };

      // Creating Bubble Chart
      Plotly.newPlot('bubble', Bubbledata, Bubblelayout);

  }).catch(error => console.log(error));
}

// Cleaning up the demographic keys
function proper(str){
  return str.toLowerCase().split(' ').map(letter => {
      return (letter.charAt(0).toUpperCase() + letter.slice(1));
  }).join(' ');
}

// Demographics
function demographics(id) {
  // To build the demographics section we need to import the data again
  d3.json('samples.json').then(function(samplesData){
      let filtered = samplesData.metadata.filter(sample => sample.id == id);
      
      // Selecting the meta-data id on the html page
      let selection = d3.select('#sample-metadata');

      // Clear any data already present
      selection.html('');

      // Appending data extracted into the panel
      Object.entries(filtered[0]).forEach(([k,v]) => {
          // console.log(k,v)
          selection.append('h5')
              .text(`${proper(k)}: ${v}`);
      });

      
      // Gauge Chart is easier to do it with demographics as the wash frequency is found under metadata
      let gaugeChart = {
          type: 'indicator',
          mode: 'gauge+number',
          title: {
              text: `<span style='font-size:0.8em; color:#263238'><b>Belly Button Washing Frequency<b><br>Scrubs per Week</span>`
          },
          subtitle: {text: `# Scrubs per week`},
          domain: {
              x: [0,5],
              y: [0,1]
          },
          value: filtered[0].wfreq,
          gauge: {
              axis: {
                  range: [null, 9]
              },
              steps: [
                  {range: [0,2], color: '#ecebbd'},
                  {range: [2,4], color: '#d8e4bc'},
                  {range: [4,6], color: '#addfad'},
                  {range: [6,8], color: '#77dd77'},
                  {range: [8,10], color: '#2e8b57'}   
              ],
              threshold: {
                  line: {color: 'yellow', width: 4},
                  thickness: 0.75,
                  value: 6
              }
          }
      };

      let Gaugedata = [gaugeChart];

      let Gaugelayout = {
          width: 350,
          height: 350,
          margin: {t: 25, r:10, l:25, b:25}
      };

      // Creating Gauge Chart
      Plotly.newPlot('gauge', Gaugedata, Gaugelayout);
  }).catch(error => console.log(error));
}

getData();