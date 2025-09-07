import { Box, Button, Stack, Typography } from "@mui/material"

import MainLayout from "../layouts/MainLayout";
import { SecondLayout } from "../layouts/SecondLayout";
import { OverallAnalysis } from "../../components/testResult/OverallAnalysis";
import { RawAnswer } from "../../utils/mapAnswersToParts";
import DetailAnalysis from "../../components/testResult/DetailAnalysis";
import { useLocation, useNavigate } from "react-router-dom";

const mockAnswers: RawAnswer[] = [
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424e82"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc3d"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424e85"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc3e"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424e88"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc3f"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424e8b"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc40"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424e8e"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc41"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424e91"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc42"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424e93"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc43"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424e95"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc44"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424e97"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc45"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424e99"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc46"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424e9b"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc47"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424e9d"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc48"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424e9f"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc49"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ea1"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc4a"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ea3"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc4b"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ea5"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc4c"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ea7"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc4d"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ea9"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc4e"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424eab"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc4f"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ead"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc50"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424eaf"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc51"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424eb1"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc52"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424eb3"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc53"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424eb5"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc54"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424eb7"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc55"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424eb9"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc56"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ebb"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc57"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ebd"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc58"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ebf"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc59"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ec1"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc5a"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ec3"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc5b"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ec5"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc5c"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ec6"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc5d"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ec7"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc5e"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ec9"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc5f"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424eca"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc60"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ecb"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc61"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ecd"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc62"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ece"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc63"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ecf"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc64"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ed1"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc65"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ed2"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc66"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ed3"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc67"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ed5"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc68"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ed6"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc69"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ed7"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc6a"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ed9"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc6b"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424eda"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc6c"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424edb"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc6d"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424edd"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc6e"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ede"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc6f"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424edf"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc70"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ee1"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc71"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ee2"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc72"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ee3"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc73"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ee5"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc74"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ee6"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc75"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ee7"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc76"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ee9"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc77"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424eea"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc78"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424eeb"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc79"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424eee"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc7a"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424eef"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc7b"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ef0"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc7c"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ef3"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc7d"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ef4"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc7e"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ef5"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc7f"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ef8"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc80"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424ef9"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc81"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424efa"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc82"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424efc"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc83"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424efd"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc84"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424efe"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc85"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f00"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc86"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f01"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc87"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f02"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc88"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f04"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc89"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f05"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc8a"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f06"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc8b"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f08"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc8c"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f09"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc8d"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f0a"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc8e"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f0c"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc8f"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f0d"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc90"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f0e"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc91"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f10"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc92"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f11"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc93"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f12"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc94"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f14"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc95"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f15"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc96"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f16"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc97"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f19"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc98"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f1a"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc99"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f1b"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc9a"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f1e"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc9b"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f1f"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc9c"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f20"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc9d"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f23"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc9e"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f24"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bc9f"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f25"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bca0"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f26"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bca1"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f27"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bca2"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f28"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bca3"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f29"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bca4"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f2a"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bca5"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f2b"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bca6"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f2c"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bca7"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f2d"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bca8"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f2e"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bca9"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f2f"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcaa"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f30"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcab"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f31"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcac"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f32"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcad"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f33"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcae"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f34"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcaf"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f35"
        },
        "selectedOption": "B",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcb0"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f36"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcb1"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f37"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcb2"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f38"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcb3"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f39"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcb4"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f3a"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcb5"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f3b"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcb6"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f3c"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcb7"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f3d"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcb8"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f3e"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcb9"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f3f"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcba"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f40"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcbb"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f41"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcbc"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f42"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcbd"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f43"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcbe"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f45"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcbf"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f46"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcc0"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f47"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcc1"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f48"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcc2"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f4a"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcc3"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f4b"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcc4"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f4c"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcc5"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f4d"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcc6"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f4f"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcc7"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f50"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcc8"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f51"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcc9"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f52"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcca"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f54"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bccb"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f55"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bccc"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f56"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bccd"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f57"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcce"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f59"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bccf"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f5a"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcd0"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f5c"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcd1"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f5d"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcd2"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f5f"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcd3"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f60"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcd4"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f62"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcd5"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f63"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcd6"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f65"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcd7"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f66"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcd8"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f67"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcd9"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f69"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcda"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f6a"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcdb"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f6b"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcdc"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f6d"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcdd"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f6e"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcde"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f6f"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcdf"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f70"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bce0"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f72"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bce1"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f73"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bce2"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f74"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bce3"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f76"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bce4"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f77"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bce5"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f78"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bce6"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f79"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bce7"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f7b"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bce8"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f7c"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bce9"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f7d"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcea"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f7e"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bceb"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f81"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcec"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f82"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bced"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f83"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcee"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f84"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcef"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f85"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcf0"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f88"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcf1"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f89"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcf2"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f8a"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcf3"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f8b"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcf4"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f8c"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcf5"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f90"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcf6"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f91"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcf7"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f92"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcf8"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f93"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcf9"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f94"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcfa"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f98"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcfb"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f99"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcfc"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f9a"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcfd"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f9b"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcfe"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424f9c"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bcff"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424fa0"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bd00"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424fa1"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bd01"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424fa2"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bd02"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424fa3"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bd03"
        }
    },
    {
        "question_id": {
            "$oid": "68af851b1918226d4c424fa4"
        },
        "selectedOption": "",
        "isCorrect": false,
        "_id": {
            "$oid": "68bc4f989b5164da5bd4bd04"
        }
    }
].map((item, index) => ({
    ...item,
    question_no: index + 1
}));

const ResultTestPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    return (
        <MainLayout>
            <SecondLayout>
                <Box
                    display="flex"
                    flexDirection="column"
                    gap={3}
                    sx={{
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        p: 2,
                        boxShadow: 1,
                    }}
                >
                    {/* Header - Title*/}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            Kết quả thi: New Economy TOEIC Test 1
                        </Typography>
                        <Button variant="contained" size="small" onClick={() => navigate(location.pathname.substring(0, location.pathname.lastIndexOf("/result")))}>Quay về trang đề thi</Button>
                    </Stack>

                    {/* Section Analysis */}
                    <OverallAnalysis completion_time={136}
                        correct_question={18}
                        incorrect_question={2}
                        skip_question={180}
                        total_score={90}
                        correct_listening={15}
                        correct_reading={3} />

                    {/* Section Detail Analysis */}
                    <div className="mt-4">
                        <DetailAnalysis answers={mockAnswers} />
                    </div>
                </Box >
            </SecondLayout>
        </MainLayout>

    )
}

export default ResultTestPage;