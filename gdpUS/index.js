import * as d3 from "https://cdn.skypack.dev/d3@7.1.1";

const height = 500;
const width = 800;

d3.select('.visHolder')
  .append('svg')
  .attr('height', height)
  .attr('width', width+100);

const overlay = d3.select('.visHolder')
  .append('div')
  .attr('class', 'overlay')
  .style('opacity', 0);

const tooltip = d3.select('.visHolder')
  .append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0);

d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
  .then(data => {
    const dataset = data.data;
    
    const barWidth = width / dataset.length;
    const years = dataset.map(each => new Date(each[0]));

    years.forEach(year => {
      if (year.getMonth() >= 0 && year.getMonth() < 3) {
        year.quarter = 'Q1'
      } else if (year.getMonth() >= 3 && year.getMonth() < 6) {
        year.quarter = 'Q2'
      } else if (year.getMonth() >= 6 && year.getMonth() < 9) {
        year.quarter = 'Q3'
      } else {
        year.quarter = 'Q4'
      }
    });

    const yearsQuarter = years.map(year => {
      return `${year.getYear() + 2000 - 100} ${year.quarter}`
    })

    const xScale = d3.scaleTime()
      .domain([d3.min(years), d3.max(years)])
      .range([0, width]);

    const xAxis = d3.axisBottom().scale(xScale);

    d3.select('svg')
      .append('g')
      .call(xAxis)
      .attr('id', 'x-axis')
      .attr('transform', `translate(40, ${height-20})`);
    
    
    const gdp = dataset.map(each => each[1]);
    const linearScale = d3.scaleLinear().domain([0, d3.max(gdp)]).range([0, height]);

    const scaledGDP = gdp.map(each => {
      return linearScale(each);
    });

    const yScale = d3.scaleLinear()
      .domain([ d3.max(gdp), 0])
      .range([0, height])

    const yAxis = d3.axisLeft().scale(yScale);

    d3.select('svg')
      .append('g')
      .call(yAxis)
      .attr('id', 'y-axis')
      .attr('transform', `translate(${40}, ${-20})`);

    d3.select('svg')
      .selectAll('rect')
      .data(scaledGDP)
      .enter()
      .append('rect')
      .attr('x', (d, i) => 40 + xScale(years[i]))
      .attr('y', (d, i) => height - 20 - d)
      .attr('class', 'bar')
      .attr('height', (d, i) => d)
      .attr('width', barWidth)
      .attr('index', (d, i) => i)
      .style('fill', 'aqua')
      .attr('data-date', (d, i) => dataset[i][0])
      .attr('data-gdp', (d, i) => gdp[i])
      .on('mouseover', function (event, d) {
        let index = this.getAttribute('index');
        console.log(index);

        overlay
          .transition()
          .duration(0)
          .style('height', d + 'px')
          .style('width', barWidth + 'px')
          .style('opacity', 0.9)
          .style('top', height- 20 - d  + 'px')
          .style('left', index * barWidth - 18 + 0 + 'px')
          .style('transform', 'translateX(60px)');

        tooltip
          .html(
            `${yearsQuarter[index]}
              <br>
              $ ${gdp[index].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')} Billion
            `
          )
          .transition()
          .duration(0)
          .style('opacity', 0.9)
          .style('top', height - 100 + 'px')
          .style('left', index * barWidth + 100 + 'px')
          .attr('data-date', dataset[index][0])
        
      })
      .on('mouseout', function () {
        tooltip.transition().duration(200).style('opacity', 0);
        overlay.transition().duration(200).style('opacity', 0);
      });
    
});



