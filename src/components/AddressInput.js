import React, { useEffect, useRef } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

setOptions({
  key: process.env.PLACES_API_KEY || '',
});

function AddressInput({ className, placeholder, value, onChange, onPlaceSelect }) {
  const containerRef = useRef(null);
  const elementRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const onPlaceSelectRef = useRef(onPlaceSelect);

  // Keep refs in sync with latest props on every render
  onChangeRef.current = onChange;
  onPlaceSelectRef.current = onPlaceSelect;

  useEffect(() => {
    let cancelled = false;

    importLibrary('places').then((places) => {
      if (cancelled) return;

      const el = new places.PlaceAutocompleteElement({
        types: ['geocode', 'establishment'],
      });

      if (placeholder) el.setAttribute('placeholder', placeholder);
      el.style.colorScheme = 'light';

      containerRef.current.appendChild(el);
      elementRef.current = el;

      const handleSelect = async (e) => {
        const prediction = e.placePrediction;
        const address = prediction?.text?.toString() || prediction?.mainText?.toString() || '';
        onChangeRef.current(address);
        if (onPlaceSelectRef.current) onPlaceSelectRef.current({ address, lat: null, lng: null });

        try {
          const place = prediction.toPlace();
          await place.fetchFields(['location', 'formattedAddress']);
          const lat = place.location?.lat() ?? null;
          const lng = place.location?.lng() ?? null;
          const formattedAddress = place.formattedAddress || address;
          if (formattedAddress !== address) onChangeRef.current(formattedAddress);
          if (onPlaceSelectRef.current) onPlaceSelectRef.current({ address: formattedAddress, lat, lng });
        } catch (err) {
          // Coordinates unavailable — address string already set above
        }
      };

      el.addEventListener('gmp-select', handleSelect);
    });

    return () => {
      cancelled = true;
      if (elementRef.current) {
        elementRef.current.remove();
        elementRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className={className} />;
}

export default AddressInput;
