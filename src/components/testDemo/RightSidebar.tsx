import { FC } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../stores/store";
import QuestionChipRightBar from "./QuestionChipRightBar";
import { setCurrentGroupByQuestionId } from "../../stores/examSlice";



interface RightSidebarProps {
  isShow: boolean;
}

const RightSidebar: FC<RightSidebarProps> = ({ isShow }) => {
  const groups = useSelector((s: RootState) => s.exam.groups);
  const dispatch = useDispatch<AppDispatch>();
  const answers = useSelector((s: RootState) => s.answer.answers);
  const partsMap: Record<number, typeof groups> = {};
  groups.forEach((g) => {
    if (!partsMap[g.part]) partsMap[g.part] = [];
    partsMap[g.part].push(g);
  });
  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: isShow ? 0 : "100%" }}
      exit={{ x: "100%" }}
      transition={{ type: "tween", duration: 0.4 }}
      className="absolute right-0 w-full md:max-w-[25%] h-[calc(100vh-112px)] bg-white border-l py-4 pl-4 overflow-y-auto shadow-inner"
    >
      {Object.entries(partsMap).map(([partNumber, groupsOfPart]) => (
        <div key={partNumber} className="mb-4">
          <h3 className="font-bold text-primary mb-2">{`Part ${partNumber}`}</h3>
          <div className="flex flex-wrap gap-2">
            {groupsOfPart.map((g) =>
              g.questions.map((q) => {
                const question = q.name.replace(/^Question\s*/, "");
                const a = answers.find(ans => ans.question === Number(question));
                return (
                  <QuestionChipRightBar
                    key={question}
                    id={question}
                    answered={!!a && a.answer !== ""}
                    isFlagged={!!a && a.isFlagged}
                    onClick={() =>
                      dispatch(setCurrentGroupByQuestionId(q._id))
                    }
                  />
                );
              })
            )}
          </div>
        </div>
      ))}
    </motion.aside>
  );
};

export default RightSidebar;
