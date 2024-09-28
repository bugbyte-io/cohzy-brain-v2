import chalk from "chalk";

const graphFlowNode = (msg: string) => {
  console.log(chalk.bgBlue(msg));
};
const graphFlowDecision = (msg: string) => {
  console.log(`►► ${chalk.bgGreen(msg)}`);
};

const graphFlowDebugInfo = (msg: string) => {
  console.log(`ℹ️ ${chalk.bgBlueBright(msg)}`);
};

export { graphFlowDecision, graphFlowDebugInfo, graphFlowNode };
