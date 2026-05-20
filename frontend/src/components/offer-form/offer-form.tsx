import { FormEvent, useCallback, useState } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';

import { City, NewOffer, Offer } from '../../types/types';

import LocationPicker from '../location-picker/location-picker';
import { CITIES, CityLocation, GOODS, TYPES } from '../../const';
import { capitalize } from '../../utils';

enum FormFieldName {
  title = 'title',
  description = 'description',
  cityName = 'cityName',
  previewImage = 'previewImage',
  isPremium = 'isPremium',
  type = 'type',
  bedrooms = 'bedrooms',
  maxAdults = 'maxAdults',
  price = 'price',
  good = 'good-',
}

const OFFER_TITLE_MIN_LENGTH = 10;
const OFFER_TITLE_MAX_LENGTH = 100;
const OFFER_DESCRIPTION_MIN_LENGTH = 20;
const OFFER_DESCRIPTION_MAX_LENGTH = 1024;
const OFFER_PRICE_MIN_VALUE = 100;
const OFFER_PRICE_MAX_VALUE = 100000;
const OFFER_BEDROOMS_MIN_VALUE = 1;
const OFFER_BEDROOMS_MAX_VALUE = 8;
const OFFER_MAX_ADULTS_MIN_VALUE = 1;
const OFFER_MAX_ADULTS_MAX_VALUE = 10;

const OFFER_VALIDATION_ERROR_MESSAGES = {
  title: `Title must contain from ${OFFER_TITLE_MIN_LENGTH} to ${OFFER_TITLE_MAX_LENGTH} characters.`,
  description: `Description must contain from ${OFFER_DESCRIPTION_MIN_LENGTH} to ${OFFER_DESCRIPTION_MAX_LENGTH} characters.`,
  goods: 'Select at least one good.',
  price: `Price must be in range from ${OFFER_PRICE_MIN_VALUE} to ${OFFER_PRICE_MAX_VALUE}.`,
  bedrooms: `Bedrooms must be in range from ${OFFER_BEDROOMS_MIN_VALUE} to ${OFFER_BEDROOMS_MAX_VALUE}.`,
  maxAdults: `Max adults must be in range from ${OFFER_MAX_ADULTS_MIN_VALUE} to ${OFFER_MAX_ADULTS_MAX_VALUE}.`,
};

const getGoods = (
  entries: IterableIterator<[string, FormDataEntryValue]>
): string[] => {
  const chosenGoods: string[] = [];
  for (const entry of entries) {
    if (entry[0].startsWith(FormFieldName.good)) {
      chosenGoods.push(entry[0].slice(5));
    }
  }
  return chosenGoods;
};

const getCity = (cityName: FormDataEntryValue | null): City => {
  const name = String(cityName);
  if (cityName && CITIES.includes(name)) {
    return {
      name,
      location: CityLocation[name],
    };
  }

  return { name: CITIES[0], location: CityLocation[CITIES[0]] };
};

type OfferFormProps<T> = {
  offer: T;
  onSubmit: (offerData: T) => void;
};

const OfferForm = <T extends Offer | NewOffer>({
  offer,
  onSubmit,
}: OfferFormProps<T>): JSX.Element => {
  const {
    title,
    description,
    city,
    previewImage,
    isPremium,
    type,
    bedrooms,
    maxAdults,
    price,
    goods: chosenGoods,
    location,
  } = offer;
  const [chosenLocation, setChosenLocation] = useState(location);
  const [chosenCity, setChosenCity] = useState(city);

  const handleCityChange = (value: keyof typeof CityLocation) => {
    setChosenCity(getCity(value));
    setChosenLocation(CityLocation[value]);
  };

  const handleLocationChange = useCallback(
    ({ lat, lng }: { lat: number; lng: number }) => {
      setChosenLocation({ latitude: lat, longitude: lng });
    },
    []
  );

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      ...offer,
      title: formData.get(FormFieldName.title),
      description: formData.get(FormFieldName.description),
      city: getCity(formData.get(FormFieldName.cityName)),
      previewImage: formData.get(FormFieldName.previewImage),
      isPremium: Boolean(formData.get(FormFieldName.isPremium)),
      type: formData.get(FormFieldName.type),
      bedrooms: Number(formData.get(FormFieldName.bedrooms)),
      maxAdults: Number(formData.get(FormFieldName.maxAdults)),
      price: Number(formData.get(FormFieldName.price)),
      goods: getGoods(formData.entries()),
      location: chosenLocation,
    };

    if (
      typeof data.title !== 'string' ||
      data.title.length < OFFER_TITLE_MIN_LENGTH ||
      data.title.length > OFFER_TITLE_MAX_LENGTH
    ) {
      toast.warn(OFFER_VALIDATION_ERROR_MESSAGES.title);
      return;
    }

    if (
      typeof data.description !== 'string' ||
      data.description.length < OFFER_DESCRIPTION_MIN_LENGTH ||
      data.description.length > OFFER_DESCRIPTION_MAX_LENGTH
    ) {
      toast.warn(OFFER_VALIDATION_ERROR_MESSAGES.description);
      return;
    }

    if (!Array.isArray(data.goods) || data.goods.length < 1) {
      toast.warn(OFFER_VALIDATION_ERROR_MESSAGES.goods);
      return;
    }

    if (
      typeof data.price !== 'number' ||
      data.price < OFFER_PRICE_MIN_VALUE ||
      data.price > OFFER_PRICE_MAX_VALUE
    ) {
      toast.warn(OFFER_VALIDATION_ERROR_MESSAGES.price);
      return;
    }

    if (
      typeof data.bedrooms !== 'number' ||
      data.bedrooms < OFFER_BEDROOMS_MIN_VALUE ||
      data.bedrooms > OFFER_BEDROOMS_MAX_VALUE
    ) {
      toast.warn(OFFER_VALIDATION_ERROR_MESSAGES.bedrooms);
      return;
    }

    if (
      typeof data.maxAdults !== 'number' ||
      data.maxAdults < OFFER_MAX_ADULTS_MIN_VALUE ||
      data.maxAdults > OFFER_MAX_ADULTS_MAX_VALUE
    ) {
      toast.warn(OFFER_VALIDATION_ERROR_MESSAGES.maxAdults);
      return;
    }

    onSubmit(data);
  };

  return (
    <form
      className="form offer-form"
      action="#"
      method="post"
      onSubmit={handleFormSubmit}
    >
      <fieldset className="title-fieldset">
        <div className="form__input-wrapper">
          <label htmlFor="title" className="title-fieldset__label">
            Title
          </label>
          <input
            className="form__input title-fieldset__text-input"
            placeholder="Title"
            name={FormFieldName.title}
            id="title"
            required
            defaultValue={title}
          />
        </div>
        <div className="title-fieldset__checkbox-wrapper">
          <input
            className="form__input"
            type="checkbox"
            name={FormFieldName.isPremium}
            id="isPremium"
            defaultChecked={isPremium}
          />
          <label htmlFor="isPremium" className="title-fieldset__checkbox-label">
            Premium
          </label>
        </div>
      </fieldset>
      <div className="form__input-wrapper">
        <label htmlFor="description" className="offer-form__label">
          Description
        </label>
        <textarea
          className="form__input offer-form__textarea"
          placeholder="Description"
          name={FormFieldName.description}
          id="description"
          required
          defaultValue={description}
        />
      </div>
      <div className="form__input-wrapper">
        <label htmlFor="previewImage" className="offer-form__label">
          Preview Image
        </label>
        <input
          className="form__input offer-form__text-input"
          type="url"
          placeholder="Preview image"
          name={FormFieldName.previewImage}
          id="previewImage"
          required
          defaultValue={previewImage}
        />
      </div>
      <fieldset className="type-fieldset">
        <div className="form__input-wrapper">
          <label htmlFor="type" className="type-fieldset__label">
            Type
          </label>
          <Select
            className="type-fieldset__select"
            classNamePrefix="react-select"
            name={FormFieldName.type}
            id="type"
            defaultValue={{ value: type, label: capitalize(type) }}
            options={TYPES.map((typeItem) => ({
              value: typeItem,
              label: capitalize(typeItem),
            }))}
          />
        </div>
        <div className="form__input-wrapper">
          <label htmlFor="price" className="type-fieldset__label">
            Price
          </label>
          <input
            className="form__input type-fieldset__number-input"
            type="number"
            placeholder="100"
            name={FormFieldName.price}
            id="price"
            defaultValue={price}
          />
        </div>
        <div className="form__input-wrapper">
          <label htmlFor="bedrooms" className="type-fieldset__label">
            Bedrooms
          </label>
          <input
            className="form__input type-fieldset__number-input"
            type="number"
            placeholder="1"
            name={FormFieldName.bedrooms}
            id="bedrooms"
            required
            step={1}
            defaultValue={bedrooms}
          />
        </div>
        <div className="form__input-wrapper">
          <label htmlFor="maxAdults" className="type-fieldset__label">
            Max adults
          </label>
          <input
            className="form__input type-fieldset__number-input"
            type="number"
            placeholder="1"
            name={FormFieldName.maxAdults}
            id="maxAdults"
            required
            step={1}
            defaultValue={maxAdults}
          />
        </div>
      </fieldset>
      <fieldset className="goods-list">
        <h2 className="goods-list__title">Goods</h2>
        <ul className="goods-list__list">
          {GOODS.map((good) => (
            <li key={good} className="goods-list__item">
              <input
                type="checkbox"
                id={good}
                name={`${FormFieldName.good}${good}`}
                defaultChecked={chosenGoods.includes(good)}
              />
              <label className="goods-list__label" htmlFor={good}>
                {good}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <div className="form__input-wrapper location-picker">
        <label htmlFor="cityName" className="location-picker__label">
          Location
        </label>
        <Select
          className="location-picker__select"
          classNamePrefix="react-select"
          name={FormFieldName.cityName}
          id="cityName"
          defaultValue={{ value: city.name, label: city.name }}
          options={CITIES.map((cityItem) => ({
            value: cityItem,
            label: cityItem,
          }))}
          onChange={(evt) => {
            if (evt) {
              handleCityChange(evt.value);
            }
          }}
        />
      </div>
      <LocationPicker
        city={chosenCity}
        onChange={handleLocationChange}
        location={chosenLocation}
      />
      <button className="form__submit button" type="submit">
        Save
      </button>
    </form>
  );
};

export default OfferForm;
