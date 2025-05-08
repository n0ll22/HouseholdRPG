import React from "react";

interface Props {
    description: string;
}

const PlayerDescription: React.FC<Props> = ({ description }) => {
    return (
        <>
            <h2 className="my-5 text-xl font-bold">About me:</h2>
            <div className="mb-2">
                {description ? description : "Nothing there..."}
            </div>
        </>
    );
};

export default PlayerDescription;
