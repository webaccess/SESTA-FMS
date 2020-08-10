import React from "react";
import { Pie } from "react-chartjs-2";
import "chartjs-plugin-datalabels";

const Piechart = (props) => (
  <Pie
    data={{
      labels: props.labels ? props.labels : [],
      datasets: props.datasets ? props.datasets : [],
    }}
    options={{
      plugins: {
        datalabels: {
          display: true,
          color: "white",
          font: {
            weight: "bold",
            size: 16,
          },
        },
      },
      tooltips: {
        enabled: false,
      },
      legend: {
        labels: {
          fontSize: 19,
        },
      },
    }}
    responsive="true"
    maintainAspectRatio="true"
    {...props}
  />
);

export default Piechart;

/**
 * usage:
 * example:
 * import Piechart from "../UI/Piechart/Piechart";
 *  <Piechart
          labels={["A", "B", "C"]}
          datasets={[
            {
              data: [20, 30, 60],
              backgroundColor: ["red", "blue", "green"],
              fontSize: "20px",
            },
          ]}
        />
 */
