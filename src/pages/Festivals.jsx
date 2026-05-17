import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { festivals, regions } from "../data/festivals";
import "leaflet/dist/leaflet.css";
import "./Festivals.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Festivals() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedFestival, setSelectedFestival] = useState(null);

  const filteredFestivals = selectedRegion
    ? festivals.filter((f) => f.region === selectedRegion)
    : festivals;

  const selectedRegionData = regions.find((r) => r.id === selectedRegion);

  return (
    <div className="festivals-page">
      <div className="festivals-header">
        <h2>지역별 축제 지도</h2>
        <p>지도에서 지역을 클릭하거나 아래 목록에서 축제를 탐색하세요</p>
      </div>

      <div className="festivals-layout">
        <div className="map-container">
          <MapContainer
            center={[36.5, 127.8]}
            zoom={7}
            style={{ height: "100%", width: "100%", borderRadius: "12px" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {regions.map((region) => {
              const count = festivals.filter((f) => f.region === region.id).length;
              return (
                <Marker
                  key={region.id}
                  position={[region.lat, region.lng]}
                  eventHandlers={{
                    click: () => setSelectedRegion(region.id === selectedRegion ? null : region.id),
                  }}
                >
                  <Popup>
                    <strong>{region.name}</strong>
                    <br />
                    축제 {count}개
                    <br />
                    <button
                      style={{ marginTop: 6, padding: "4px 10px", cursor: "pointer" }}
                      onClick={() => setSelectedRegion(region.id)}
                    >
                      보기
                    </button>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        <div className="festivals-sidebar">
          <div className="region-filter">
            <button
              className={`region-btn ${!selectedRegion ? "active" : ""}`}
              onClick={() => setSelectedRegion(null)}
            >
              전체
            </button>
            {regions.map((r) => (
              <button
                key={r.id}
                className={`region-btn ${selectedRegion === r.id ? "active" : ""}`}
                onClick={() => setSelectedRegion(selectedRegion === r.id ? null : r.id)}
              >
                {r.name}
              </button>
            ))}
          </div>

          <p className="result-count">
            {selectedRegionData ? `${selectedRegionData.name} 축제` : "전체 축제"} —{" "}
            {filteredFestivals.length}개
          </p>

          <div className="festival-list">
            {filteredFestivals.map((festival) => (
              <div
                key={festival.id}
                className="festival-card"
                onClick={() => setSelectedFestival(festival)}
              >
                <img src={festival.image} alt={festival.name} />
                <div className="festival-info">
                  <span className="festival-date">{festival.date}</span>
                  <h3>{festival.name}</h3>
                  <p>{festival.description}</p>
                  <div className="tags">
                    {festival.tags.map((tag) => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedFestival && (
        <div className="modal-overlay" onClick={() => setSelectedFestival(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedFestival(null)}>✕</button>
            <img src={selectedFestival.image} alt={selectedFestival.name} />
            <div className="modal-body">
              <span className="festival-date">{selectedFestival.date}</span>
              <h2>{selectedFestival.name}</h2>
              <p>{selectedFestival.description}</p>
              <div className="tags">
                {selectedFestival.tags.map((tag) => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
              <p className="modal-region">
                📍 {regions.find((r) => r.id === selectedFestival.region)?.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
