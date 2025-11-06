import { Button } from "@mui/material"

interface ButtonCardProps {
    icon: React.ReactElement;
    text: string;
    onClick?: () => void;
}
export const ButtonCard = ({ icon, text, onClick }: ButtonCardProps) => {
    return <Button
        startIcon={icon}
        onClick={onClick}
        sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: 2,
            border: "2px solid",
            borderColor: "primary.main",
            borderBottomWidth: 4, // viền dưới dày hơn
            borderRadius: 2,
            backgroundColor: "background.paper",
            color: "primary.main",
            textTransform: "none",
            fontSize: "16px",
            fontWeight: "bold",
            "&:hover": {
                backgroundColor: "primary.light",
                color: "white",
                borderColor: "primary.dark",
                "& .MuiButton-startIcon svg": {
                    filter: "brightness(1.3)"
                },
            },
            "& .MuiButton-startIcon": {
                "& > *:nth-of-type(1)": {
                    fontSize: 24, // to hơn
                },
            },

        }}
    >
        {text}
    </Button>

}