import { ViewUrlModal } from "../components";
import { useGetShortenedUrlQuery } from "../api/shortenedUrlApi";
import { useNavigate, useParams } from "react-router-dom";
import { handleCopyShortUrl } from "../utils";

const ViewUrlPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const urlId = Number(params.id);
  const navigate = useNavigate();
  const { data: selectedUrl } = useGetShortenedUrlQuery(urlId!, { skip: !urlId });

  const handleClose = () => {
    navigate("/");
  };

  return <ViewUrlModal url={selectedUrl} isOpen={true} onClose={handleClose} onCopy={handleCopyShortUrl} />;
};

export default ViewUrlPage;
