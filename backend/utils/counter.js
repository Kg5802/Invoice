import CounterModel from "../model/counter.model.js";

const getNextSequence = async (name)=>{
    const counter = await CounterModel.findOneAndUpdate(
    { name },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
    }
  );

  return counter.sequence;
};

export default getNextSequence;
