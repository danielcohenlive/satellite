import { healthMessage } from "../src/stats";
import "jest";
const dateFactory = (secondsAgo: number) => {
  var date = new Date();
  date.setSeconds(date.getSeconds() - secondsAgo);
  return date;
};
describe("healthMessage", () => {
  it("returns no data, when there is no recent data", () => {
    expect(
      healthMessage([{ lastUpdated: dateFactory(121), altitude: 150 }])
    ).toStrictEqual("NO DATA");
  });
  it("returns A OK if there is data and none bellow threshold", () => {
    expect(
      healthMessage([{ lastUpdated: new Date(), altitude: 170 }])
    ).toStrictEqual("Altitude is A-OK");
  });
  it("warns if the first minute is below threshold", () => {
    expect(
      healthMessage([
        { lastUpdated: dateFactory(1), altitude: 150 },
        { lastUpdated: dateFactory(20), altitude: 150 },
        { lastUpdated: dateFactory(61), altitude: 150 },
        { lastUpdated: dateFactory(70), altitude: 160 },
        { lastUpdated: dateFactory(121), altitude: 160 },
      ])
    ).toStrictEqual("WARNING: RAPID ORBITAL DECAY IMMINENT");
  });
  it("counts as healthy if there is not one continous minute beneath the threshold", () => {
    expect(
      healthMessage([
        { lastUpdated: dateFactory(0), altitude: 150 },
        { lastUpdated: dateFactory(20), altitude: 150 },
        { lastUpdated: dateFactory(40), altitude: 150 },
        { lastUpdated: dateFactory(60), altitude: 160 },
        { lastUpdated: dateFactory(70), altitude: 150 },
        { lastUpdated: dateFactory(90), altitude: 150 },
        { lastUpdated: dateFactory(120), altitude: 150 },
      ])
    ).toStrictEqual("Altitude is A-OK");
  });
  it("will not check more than 2 minutes worth of data", () => {
    expect(
      healthMessage([
        { lastUpdated: dateFactory(1), altitude: 150 },
        { lastUpdated: dateFactory(21), altitude: 160 },
        { lastUpdated: dateFactory(41), altitude: 160 },
        { lastUpdated: dateFactory(51), altitude: 160 },
        { lastUpdated: dateFactory(61), altitude: 140 },
        { lastUpdated: dateFactory(71), altitude: 140 },
        { lastUpdated: dateFactory(91), altitude: 140 },
        { lastUpdated: dateFactory(121), altitude: 140 },
      ])
    ).toStrictEqual("Altitude is A-OK");
  });
  it("returns sustained message if there is a streak starting in the last minute", () => {
    expect(
      healthMessage([
        { lastUpdated: dateFactory(0), altitude: 150 },
        { lastUpdated: dateFactory(20), altitude: 160 },
        { lastUpdated: dateFactory(40), altitude: 170 },
        { lastUpdated: dateFactory(50), altitude: 159 },
        { lastUpdated: dateFactory(70), altitude: 150 },
        { lastUpdated: dateFactory(90), altitude: 150 },
        { lastUpdated: dateFactory(110), altitude: 150 },
        { lastUpdated: dateFactory(120), altitude: 160 },
      ])
    ).toStrictEqual("Sustained Low Earth Orbit Resumed");
  });
});
